import { NextResponse } from "next/server";
import { getRecommendedResources } from "@/lib/rag";

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic = "System Design", answerText = "" } = body;

    const score = Math.min(95, Math.max(50, answerText.length > 50 ? 85 : 65));
    const xpAwarded = score >= 80 ? 150 : 100;
    const recommended = getRecommendedResources(topic);

    return NextResponse.json({
      success: true,
      data: {
        score,
        correctness: score >= 75 ? "accurate" : "partial",
        strengths: ["Clear structure provided", "Good foundational concepts"],
        gaps: ["Could dive deeper into edge cases under failure"],
        feedbackText: `Solid response for ${topic}. Your key points were well presented.`,
        xpAwarded,
        recommendedResources: recommended
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
