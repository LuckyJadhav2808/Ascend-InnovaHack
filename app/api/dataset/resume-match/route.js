import { NextResponse } from "next/server";
import { analyzeResumeSkillGap } from "@/lib/datasetLoader";
import { extractResumeSkills } from "@/lib/geminiClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const { resumeText, skills } = body;

    let extractedSkills = skills || [];

    // If raw resume text provided, use Gemini to extract skills
    if (resumeText && (process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY)) {
      const aiResult = await extractResumeSkills(resumeText);
      if (aiResult && aiResult.skills) {
        extractedSkills = [...new Set([...extractedSkills, ...aiResult.skills])];
      }
    }

    // Cross-reference extracted skills against job dataset & ATS data
    const gapAnalysis = analyzeResumeSkillGap(extractedSkills);

    return NextResponse.json({
      success: true,
      extractedSkills,
      gapAnalysis
    });
  } catch (error) {
    console.error("API /api/dataset/resume-match error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
