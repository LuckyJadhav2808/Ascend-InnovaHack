import { NextResponse } from "next/server";
import { getQuestionsForTrack, getPatterns, getAntiPatterns } from "@/lib/datasetLoader";

export async function POST(request) {
  try {
    const body = await request.json();
    const { track = "web-developer", difficulty = "Senior", skillGraph = null } = body;

    // Load authentic track questions directly from local dataset CSVs
    const datasetQuestions = getQuestionsForTrack(track, 10, skillGraph);
    const patterns = getPatterns();
    const antiPatterns = getAntiPatterns();

    // Shuffle questions randomly every session invocation
    const shuffledQuestions = [...datasetQuestions].sort(() => Math.random() - 0.5);

    const q1 = shuffledQuestions[0] || {
      topic: track,
      prompt: `How would you design and structure a high-performance production application for ${track}? Explain your core architecture decisions.`,
      referenceAnswer: `Core architecture for ${track} includes modular component design, caching strategies, state management, and scalability.`
    };

    const q2 = shuffledQuestions[1] || {
      topic: q1.topic,
      prompt: `Focusing on ${q1.topic}: What latency bottlenecks or data management trade-offs do you anticipate under high traffic?`,
      referenceAnswer: "Evaluate caching, indexing, data structures, and network overhead."
    };

    const q3 = shuffledQuestions[2] || {
      topic: q1.topic,
      prompt: `Suppose a critical component or service fails under peak load during operations. Walk me through your error handling, fallback mechanisms, and recovery sequence.`,
      referenceAnswer: "Implement circuit breakers, graceful degradation, fallback responses, and health checks."
    };

    const probeQuestions = [
      {
        stage: 1,
        title: `Stage 1: ${q1.topic} — System Architecture & Design`,
        prompt: q1.prompt,
        topic: q1.topic,
        referenceAnswer: q1.referenceAnswer || ""
      },
      {
        stage: 2,
        title: `Stage 2: ${q2.topic} — Technical Deep Dive & Trade-offs`,
        prompt: q2.prompt,
        topic: q2.topic,
        referenceAnswer: q2.referenceAnswer || ""
      },
      {
        stage: 3,
        title: `Stage 3: ${q3.topic} — Failure Mode & Edge Case Recovery`,
        prompt: q3.prompt,
        topic: q3.topic,
        referenceAnswer: q3.referenceAnswer || ""
      }
    ];

    const sessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      track,
      difficulty,
      stages: probeQuestions,
      datasetContext: {
        patternsCount: patterns.length,
        antiPatternsCount: antiPatterns.length
      }
    };

    return NextResponse.json({ success: true, session: sessionData });
  } catch (error) {
    console.error("API /api/mock-interview/session error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
