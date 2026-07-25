/**
 * ASCEND — Gemini AI Client
 * 
 * Server-side only. Wraps @google/generative-ai for:
 * - Skill graph generation from dataset context
 * - Open-ended answer evaluation (voice/text)
 * - Personalized roadmap generation
 * - Resume skill extraction & gap analysis
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Use Gemini 2.0 Flash for fast, cost-effective responses
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Generate a skill graph for a given track using dataset context
 */
export async function generateSkillGraph(trackTitle, jobSkills = [], datasetContext = "") {
  const prompt = `You are an expert technical interview coach. A candidate has selected the track: "${trackTitle}".

The following skills are associated with this role from our job dataset:
${jobSkills.join(", ")}

Additional dataset context:
${datasetContext}

Generate a skill graph with 6-10 nodes representing the most important technical topics this candidate needs to master for their interview. Each node should have:
- id: a short kebab-case identifier
- topic: the display name of the skill/topic
- mastery: 0 (always start at 0, no pre-seeding)
- status: "weak" (always start weak)
- category: one of "Frontend", "Backend", "Database", "DevOps", "Architecture", "AI/ML", "DSA", "Core", "Testing", "Security"

Also generate edges connecting related topics (prerequisite relationships).

Respond ONLY with valid JSON in this exact format, no markdown, no explanation:
{"nodes":[{"id":"","topic":"","mastery":0,"status":"weak","category":""}],"edges":[{"from":"","to":""}]}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("[Gemini] generateSkillGraph error:", error.message);
    return null;
  }
}

/**
 * Evaluate an open-ended answer using Gemini AI
 */
export async function evaluateAnswer(question, answer, topic, referenceAnswer = "") {
  const prompt = `You are a senior technical interviewer evaluating a candidate's answer.

Question: "${question}"
Topic: "${topic}"
${referenceAnswer ? `Reference Answer: "${referenceAnswer}"` : ""}

Candidate's Answer: "${answer}"

IMPORTANT GRADING RULES:
1. If the candidate's answer is incomplete, cuts off mid-sentence (e.g. ending in "is", "a", "the"), or merely repeats the question without explaining the technical concept, return score: 0.
2. If candidate says "i don't know" or doesn't answer, return score: 0.
3. Award 70-100 only for clear, accurate explanations.

Evaluate the answer and respond ONLY with valid JSON in this exact format, no markdown:
{
  "score": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "feedback": "<2-3 sentence constructive feedback>",
  "conceptsCovered": ["<concept 1>", "<concept 2>"],
  "suggestedTopics": ["<topic to study further>"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.warn("[Gemini] evaluateAnswer notice:", error.message);
    return null;
  }
}

/**
 * Generate a personalized roadmap using Gemini + dataset context
 */
export async function generateRoadmap(trackTitle, weakTopics = [], patternsContext = "", trendsContext = "") {
  const prompt = `You are an expert interview prep coach. A candidate is preparing for: "${trackTitle}".

Their weakest topics (lowest mastery) are:
${weakTopics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

System design patterns from our dataset:
${patternsContext}

Trending topics from our dataset:
${trendsContext}

Generate a 4-day personalized study roadmap. Each day should focus on one weak topic with 3 specific actionable tasks.

Respond ONLY with valid JSON in this exact format, no markdown:
{"days":[{"day":1,"focusTopic":"","badge":"","tasks":[{"title":"","done":false}]}]}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("[Gemini] generateRoadmap error:", error.message);
    return null;
  }
}

/**
 * Extract skills from resume text using Gemini AI
 */
export async function extractResumeSkills(resumeText) {
  const prompt = `You are an expert ATS resume parser. Extract all technical skills, tools, frameworks, and programming languages from this resume text.

Resume:
"${resumeText.substring(0, 3000)}"

Respond ONLY with valid JSON in this exact format, no markdown:
{"skills":["React","Node.js","Python"],"experience_years":0,"strongest_domain":"Frontend"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { skills: [], experience_years: 0, strongest_domain: "General" };
  } catch (error) {
    console.error("[Gemini] extractResumeSkills error:", error.message);
    return { skills: [], experience_years: 0, strongest_domain: "General" };
  }
}
