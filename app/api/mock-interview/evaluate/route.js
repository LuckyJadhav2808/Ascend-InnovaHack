import { NextResponse } from "next/server";
import { evaluateAnswer } from "@/lib/geminiClient";
import { getPatterns, getAntiPatterns } from "@/lib/datasetLoader";

export async function POST(request) {
  try {
    const body = await request.json();
    const { transcript = [], track = "sde-backend", difficulty = "Senior" } = body;

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ success: false, error: "Empty interview transcript" }, { status: 400 });
    }

    // Extract all candidate answers from transcript
    const candidateAnswers = transcript.filter((t) => t.role === "candidate").map((t) => t.text);
    const combinedAnswerText = candidateAnswers.join(" ");

    // Basic validity check for candidate participation
    const words = combinedAnswerText.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const isVeryShort = words.length < 15;

    let scorecard = null;

    if (process.env.GEMINI_API_KEY && !isVeryShort) {
      try {
        const prompt = `You are a Senior Staff Engineer conducting a bar-raiser technical interview for a ${difficulty} level candidate applying for track: "${track}".

Below is the multi-turn interview transcript:
${transcript.map((t) => `${t.role.toUpperCase()}: "${t.text}"`).join("\n")}

Evaluate the candidate's total performance across System Architecture, Technical Deep Dive, and Edge Case Failures.

Respond ONLY with valid JSON in this exact structure, no markdown:
{
  "hiringDecision": "STRONG HIRE" | "HIRE" | "LEAN NO" | "NO HIRE",
  "decisionSummary": "2-3 sentence executive summary of the hiring recommendation.",
  "scores": {
    "systemDesign": <number 0-100>,
    "communication": <number 0-100>,
    "codeEfficiency": <number 0-100>,
    "overall": <number 0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "redFlags": ["<red flag or gap 1>", "<red flag 2>"],
  "keyTakeaways": ["<takeaway 1>", "<takeaway 2>"],
  "recommendedDatasetTopics": ["<topic 1>", "<topic 2>"]
}`;

        const evaluationRaw = await evaluateAnswer("Complete Technical Interview Screen", combinedAnswerText, track, prompt);
        if (evaluationRaw && evaluationRaw.hiringDecision) {
          scorecard = evaluationRaw;
        }
      } catch (err) {
        console.warn("Gemini evaluation in mock interview failed, using dataset evaluator fallback:", err);
      }
    }

    // Dataset Fallback Engine if Gemini API is unavailable or rate-limited
    if (!scorecard) {
      const patterns = getPatterns();
      const antiPatterns = getAntiPatterns();

      const stopWords = new Set(["what", "is", "the", "a", "an", "and", "or", "in", "of", "to", "for", "with", "that", "this", "can", "have", "has", "are", "be"]);
      const ansWords = words.map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w.length > 2 && !stopWords.has(w));
      const ansWordSet = new Set(ansWords);

      // Match patterns
      const matchedPatterns = patterns.filter((p) => {
        const name = p.pattern_name.toLowerCase();
        return ansWords.some((w) => name.includes(w));
      });

      // Match anti-patterns
      const matchedAnti = antiPatterns.filter((ap) => {
        const name = ap.anti_pattern_name.toLowerCase();
        return ansWords.some((w) => name.includes(w));
      });

      let systemDesign = Math.min(92, Math.max(20, ansWords.length * 3 + matchedPatterns.length * 10));
      let communication = Math.min(90, Math.max(25, ansWords.length * 2.5));
      let codeEfficiency = Math.min(95, Math.max(30, ansWords.length * 2.8 - matchedAnti.length * 15));

      if (isVeryShort) {
        systemDesign = 15;
        communication = 20;
        codeEfficiency = 10;
      }

      const overall = Math.round((systemDesign * 0.4) + (communication * 0.3) + (codeEfficiency * 0.3));

      let hiringDecision = "NO HIRE";
      if (overall >= 82) hiringDecision = "STRONG HIRE";
      else if (overall >= 70) hiringDecision = "HIRE";
      else if (overall >= 45) hiringDecision = "LEAN NO";

      const strengths = [];
      if (ansWords.length > 30) strengths.push("Provided detailed architectural breakdowns during questions");
      if (matchedPatterns.length > 0) strengths.push(`Referenced recognized system design patterns (${matchedPatterns.slice(0, 2).map((p) => p.pattern_name).join(", ")})`);
      if (strengths.length === 0) strengths.push("Participated in technical interview screen");

      const redFlags = [];
      if (isVeryShort) redFlags.push("Response was extremely brief with insufficient technical detail");
      if (matchedAnti.length > 0) redFlags.push(`Exhibited anti-pattern characteristics (${matchedAnti.slice(0, 2).map((a) => a.anti_pattern_name).join(", ")})`);
      if (redFlags.length === 0) redFlags.push("Could expand more on edge case failure recovery mechanisms");

      scorecard = {
        hiringDecision,
        decisionSummary: `Candidate demonstrated ${hiringDecision === "STRONG HIRE" || hiringDecision === "HIRE" ? "strong technical fundamentals and architectural clarity" : "limited depth in failure recovery and trade-off analysis"} across 3 interview turns. Overall score: ${overall}/100.`,
        scores: {
          systemDesign,
          communication,
          codeEfficiency,
          overall
        },
        strengths,
        redFlags,
        keyTakeaways: [
          `System Design Score: ${systemDesign}/100 based on dataset keyword alignment`,
          `Communication Score: ${communication}/100 based on response depth and structure`
        ],
        recommendedDatasetTopics: ["Distributed Caching", "Rate Limiting", "Circuit Breakers"]
      };
    }

    return NextResponse.json({ success: true, scorecard });
  } catch (error) {
    console.error("API /api/mock-interview/evaluate error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
