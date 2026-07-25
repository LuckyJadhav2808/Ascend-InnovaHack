import { NextResponse } from "next/server";
import { getATSResumes, getJobDataset } from "@/lib/datasetLoader";
import { evaluateAnswer } from "@/lib/geminiClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const { resumeText = "", track = "web-developer" } = body;

    if (!resumeText || resumeText.trim().length < 15) {
      return NextResponse.json({ success: false, error: "Resume content is empty or too short" }, { status: 400 });
    }

    const cleanText = resumeText.toLowerCase().trim();
    const words = cleanText.split(/\s+/).filter(Boolean);

    // Cross-reference against job dataset for target track with token matching
    const jobs = getJobDataset();
    const trackTokens = track.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(Boolean);

    const targetJob =
      jobs.find((j) => {
        const titleLower = (j.Title || "").toLowerCase();
        return trackTokens.every((tok) => titleLower.includes(tok));
      }) ||
      jobs.find((j) => {
        const titleLower = (j.Title || "").toLowerCase();
        return trackTokens.some((tok) => titleLower.includes(tok));
      }) ||
      jobs.find((j) => (j.Title || "").toLowerCase().includes("web")) ||
      jobs[0];

    const requiredSkills = (targetJob?.Skills || "JavaScript;React;Node.js;HTML;CSS;REST APIs;Git")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    const requiredKeywords = (targetJob?.Keywords || "Agile;CI/CD;Unit Testing;System Design;Optimization")
      .split(";")
      .map((k) => k.trim())
      .filter(Boolean);

    const allTargetTerms = [...new Set([...requiredSkills, ...requiredKeywords])];

    const matchedKeywords = allTargetTerms.filter((term) => cleanText.includes(term.toLowerCase()));
    const missingKeywords = allTargetTerms.filter((term) => !cleanText.includes(term.toLowerCase()));

    // Extract individual project bullet points (Filtering out metadata, contact info, education & skills lists)
    const rawChunks = resumeText
      .split(/(?:\n+|[●•\-\*]\s*|\.\s+(?=[A-Z]))/)
      .map((b) => b.replace(/^[\s•\-\*\d\.]+\s*/, "").trim())
      .filter((b) => {
        if (b.length < 25 || b.length > 280) return false;
        const lower = b.toLowerCase();
        if (lower.includes("mailto:") || lower.includes("linkedin:") || lower.includes("github:") || lower.includes("portfolio:")) return false;
        if (lower.includes("education") || lower.includes("college") || lower.includes("skills") || lower.includes("achievements")) return false;
        if (lower.includes("cgpa:") || lower.includes("msbshse") || lower.includes("hackathon:")) return false;
        if (lower.startsWith("<<") || lower.includes("/structtreeroot") || lower.includes("/procset")) return false;
        return true;
      });

    // Fallback if no specific bullets matched
    const rawBullets = rawChunks.length > 0 ? rawChunks : [
      "Built a real-time multiplayer game where players solve coding problems together while one hidden Impostor tries to sabotage the shared code editor.",
      "Used Yjs CRDTs for conflict-free live editing across multiple cursors, and Socket.io to run the game logic on the server.",
      "Designed a marketplace where users can buy and sell renewable energy directly from each other, with live listings and an analytics dashboard."
    ];

    let evaluationResult = null;

    // Use Gemini AI for deep bullet analysis if API key is present
    if (process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = `You are an executive ATS Resume Architect evaluating a candidate's resume for a "${track}" position.

Resume Content:
"${resumeText}"

Evaluate the resume and return valid JSON with NO markdown:
{
  "atsScore": <number 0-100>,
  "atsTier": "ELITE ATS READY" | "COMPETITIVE" | "NEEDS IMPACT" | "ATS WEAK",
  "summaryAdvice": "2-3 sentences summarizing key strengths and missing impact.",
  "sectionScores": {
    "bulletImpact": <number 0-100>,
    "skillAlignment": <number 0-100>,
    "formattingClarity": <number 0-100>
  },
  "actionableAdvice": ["<advice 1>", "<advice 2>", "<advice 3>"],
  "bulletRewrites": [
    {
      "original": "<original single project bullet point>",
      "rewritten": "<strong metric-driven rewrite for that single bullet point>",
      "impactNote": "<why this rewrite improves ATS score>"
    }
  ]
}`;

        const aiResponse = await evaluateAnswer("Resume ATS Enhancer", resumeText, track, prompt);
        if (aiResponse && aiResponse.atsScore !== undefined) {
          evaluationResult = aiResponse;
        }
      } catch (err) {
        console.warn("Gemini resume enhancer notice:", err);
      }
    }

    // Offline Local Dataset Fallback Evaluator
    if (!evaluationResult) {
      const matchRatio = matchedKeywords.length / (allTargetTerms.length || 1);
      const hasMetrics = /\d+%|\$\d+|\d+\+?\s*(users|requests|ms|sec|x)/.test(cleanText);

      let atsScore = Math.min(95, Math.max(35, Math.round(matchRatio * 70 + (hasMetrics ? 20 : 5) + Math.min(10, words.length / 20))));
      if (words.length < 40) atsScore = 25;

      let atsTier = "ATS WEAK";
      if (atsScore >= 82) atsTier = "ELITE ATS READY";
      else if (atsScore >= 70) atsTier = "COMPETITIVE";
      else if (atsScore >= 48) atsTier = "NEEDS IMPACT";

      const actionVerbs = ["Architected", "Engineered", "Spearheaded", "Optimized", "Scaled"];
      const metrics = ["35% latency reduction", "500+ concurrent sessions", "99.9% uptime", "40% faster state sync"];

      const bulletRewrites = rawBullets.slice(0, 3).map((orig, idx) => {
        const verb = actionVerbs[idx % actionVerbs.length];
        const metric = metrics[idx % metrics.length];
        const cleanedOrig = orig.replace(/^(built|used|designed|added|supported|gave|created|managed|helped)\s+/i, "");

        return {
          original: orig,
          rewritten: `${verb} ${cleanedOrig.charAt(0).toLowerCase() + cleanedOrig.slice(1)}, achieving ${metric} and production reliability across active users.`,
          impactNote: `Replaced weak verb with '${verb}', added quantifiable metric (${metric}), and highlighted production engineering impact.`
        };
      });

      evaluationResult = {
        atsScore,
        atsTier,
        summaryAdvice: `Your resume demonstrates ${atsScore >= 70 ? "strong alignment" : "moderate technical coverage"} for ${track}. Adding quantifiable metrics and missing target keywords will elevate your ATS score.`,
        sectionScores: {
          bulletImpact: hasMetrics ? 85 : 55,
          skillAlignment: Math.round(matchRatio * 100),
          formattingClarity: words.length > 50 ? 80 : 50
        },
        actionableAdvice: [
          `Incorporate missing high-demand ATS keywords: ${missingKeywords.slice(0, 3).join(", ") || "Docker, CI/CD"}`,
          "Quantify bullet achievements with percentage increases, latency reductions, or request volume",
          "Ensure every bullet point begins with a strong active verb (e.g., Architected, Engineered, Spearheaded)"
        ],
        bulletRewrites
      };
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        ...evaluationResult,
        matchedKeywords,
        missingKeywords,
        targetTrack: track
      }
    });
  } catch (error) {
    console.error("API /api/dataset/resume-enhance error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
