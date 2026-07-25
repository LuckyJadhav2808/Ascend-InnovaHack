import { NextResponse } from "next/server";
import { ASSESSMENT_QUESTIONS } from "@/lib/mockData";

export async function POST(request) {
  try {
    const body = await request.json();
    const { track = "sde-backend", mode = "practice" } = body;

    const questions = ASSESSMENT_QUESTIONS[track] || ASSESSMENT_QUESTIONS["sde-backend"];
    const randomQ = questions[Math.floor(Math.random() * questions.length)];

    return NextResponse.json({
      success: true,
      data: {
        questionId: randomQ.id,
        topic: randomQ.topic,
        difficulty: randomQ.difficulty,
        prompt: randomQ.prompt,
        mode
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
