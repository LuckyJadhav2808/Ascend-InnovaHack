import { NextResponse } from "next/server";
import { getQuestionsForTrack } from "@/lib/datasetLoader";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("track") || "sde-backend";
    const count = parseInt(searchParams.get("count") || "10", 10);
    const skillGraphRaw = searchParams.get("skillGraph");

    let skillGraph = null;
    if (skillGraphRaw) {
      try {
        skillGraph = JSON.parse(decodeURIComponent(skillGraphRaw));
      } catch (e) {
        // Ignore parse errors, proceed without skill graph context
      }
    }

    const topicParam = searchParams.get("topic");

    let questions = getQuestionsForTrack(trackId, count, skillGraph);

    if (topicParam) {
      const topicLower = topicParam.toLowerCase();
      const topicFiltered = questions.filter((q) => {
        const qTopic = (q.topic || "").toLowerCase();
        const qPrompt = (q.prompt || "").toLowerCase();
        return qTopic.includes(topicLower) || qPrompt.includes(topicLower);
      });

      if (topicFiltered.length > 0) {
        questions = topicFiltered;
      } else {
        // Generate a focused question for this topic
        questions = [
          {
            id: `topic_focused_${Date.now()}`,
            source: "topic_focused",
            topic: topicParam,
            difficulty: "Medium",
            prompt: `How would you architect, implement, and optimize ${topicParam} in a high-concurrency production application? What core trade-offs and edge cases would you balance?`
          },
          ...questions
        ].slice(0, count);
      }
    }

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("API /api/dataset/questions error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
