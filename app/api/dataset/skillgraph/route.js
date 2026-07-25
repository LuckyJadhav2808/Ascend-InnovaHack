import { NextResponse } from "next/server";
import { buildSkillGraphForTrack, getJobDataset } from "@/lib/datasetLoader";
import { generateSkillGraph } from "@/lib/geminiClient";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("track") || "sde-backend";
    const customTopicsRaw = searchParams.get("customTopics") || "";
    const customTopics = customTopicsRaw ? customTopicsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

    // 1. Get job dataset skills for this track
    const jobs = getJobDataset();
    const matchingJob = jobs.find((j) => {
      const jobId = (j.Title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return jobId === trackId || jobId.includes(trackId) || trackId.includes(jobId);
    });

    const jobSkills = matchingJob
      ? (matchingJob.Skills || "").split(";").map((s) => s.trim()).filter(Boolean)
      : customTopics;

    // 2. Try Gemini AI for intelligent graph generation
    let graph = null;
    if (process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY) {
      const trackTitle = matchingJob?.Title || trackId;
      const datasetContext = matchingJob
        ? `Role: ${matchingJob.Title}, Experience: ${matchingJob.ExperienceLevel}, Keywords: ${matchingJob.Keywords}`
        : `Custom track with topics: ${customTopics.join(", ")}`;

      graph = await generateSkillGraph(trackTitle, jobSkills.length > 0 ? jobSkills : customTopics, datasetContext);
    }

    // 3. Fallback to dataset-only graph if Gemini unavailable
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      graph = buildSkillGraphForTrack(trackId, customTopics);
    }

    // Ensure all mastery starts at 0
    graph.nodes = graph.nodes.map((n) => ({ ...n, mastery: 0, status: "weak" }));

    return NextResponse.json({ success: true, graph });
  } catch (error) {
    console.error("API /api/dataset/skillgraph error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
