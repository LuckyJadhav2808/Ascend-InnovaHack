import { NextResponse } from "next/server";
import { evaluateAnswer } from "@/lib/geminiClient";
import { getQuestionsForTrack, getPatterns, getAntiPatterns } from "@/lib/datasetLoader";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      previousAnswer = "",
      currentStageIndex = 0,
      track = "web-developer",
      topic = "System Architecture",
      transcript = []
    } = body;

    const cleanAns = previousAnswer.toLowerCase().trim();
    const isUnknown = [
      "i don't know",
      "i dont know",
      "dont know",
      "don't know",
      "idk",
      "no idea",
      "pass",
      "skip",
      "dunno",
      "not sure"
    ].some((pattern) => cleanAns.includes(pattern)) || cleanAns.length < 6;

    const nextStageNumber = currentStageIndex + 2; // e.g. Stage 2 or Stage 3

    if (isUnknown) {
      // Empathetic Staff Engineer pivot response
      const pivotResponses = [
        `No worries at all! Technical depth varies across domains. Let's pivot: how would you structure high-level monitoring and health checks for a production ${track} service?`,
        `That's completely fine! Let's approach this from another angle: what primary strategy would you use to prevent cascading failures when a downstream database goes offline?`,
        `No problem! Let's focus on operational simplicity: how would you design your deployment pipeline and rollbacks for a high-traffic ${track} app?`
      ];

      const chosenPivot = pivotResponses[currentStageIndex % pivotResponses.length];

      return NextResponse.json({
        success: true,
        isUnknownPivot: true,
        nextStage: {
          stage: nextStageNumber,
          title: `Stage ${nextStageNumber}: Technical Pivot & System Resilience`,
          prompt: chosenPivot,
          topic
        }
      });
    }

    // Dynamic AI follow-up probe generation using Gemini or local dataset
    let nextPrompt = null;

    if (process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY) {
      try {
        const prompt = `You are a Senior Staff Engineer interviewing a candidate for a ${track} role.
Candidate just answered Stage ${currentStageIndex + 1} with: "${previousAnswer}".

Generate a natural, direct follow-up probe question for Stage ${nextStageNumber} that evaluates either:
1. Time complexity, latency bottlenecks, or database indexing trade-offs of their proposed approach.
2. Failure recovery, cache stampedes, or circuit breaker mechanisms under peak load.

Respond with ONLY the exact question string (1-2 clear, direct sentences).`;

        const aiResponse = await evaluateAnswer("Interview Probe Generation", previousAnswer, track, prompt);
        if (typeof aiResponse === "string" && aiResponse.trim().length > 15) {
          nextPrompt = aiResponse.trim();
        } else if (aiResponse && aiResponse.feedback) {
          nextPrompt = aiResponse.feedback;
        }
      } catch (err) {
        console.warn("Gemini probe generation error, using dataset probe fallback:", err);
      }
    }

    // Fallback Probe Generator using local patterns & dataset
    if (!nextPrompt) {
      const patterns = getPatterns();
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]?.pattern_name || "Caching & Circuit Breakers";

      if (nextStageNumber === 2) {
        nextPrompt = `Focusing on your proposed design for ${topic}: What specific database indexing strategy and latency trade-offs would you enforce under peak concurrency? How does your design incorporate ${randomPattern}?`;
      } else {
        nextPrompt = `Suppose your primary caching layer suffers a sudden node failure and causes a cache stampede on the primary database. Walk me through your circuit breaker mechanism, emergency throttling, and recovery sequence.`;
      }
    }

    return NextResponse.json({
      success: true,
      isUnknownPivot: false,
      nextStage: {
        stage: nextStageNumber,
        title: nextStageNumber === 2 ? "Stage 2: Technical Deep Dive & Trade-offs" : "Stage 3: Failure Mode & Edge Case Recovery",
        prompt: nextPrompt,
        topic
      }
    });
  } catch (error) {
    console.error("API /api/mock-interview/probe error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
