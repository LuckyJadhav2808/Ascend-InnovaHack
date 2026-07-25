import { NextResponse } from "next/server";
import { buildRoadmapForTrack, getPatterns, getAntiPatterns, getYearlyTrends } from "@/lib/datasetLoader";
import { generateRoadmap } from "@/lib/geminiClient";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("track") || "sde-backend";
    const trackTitle = searchParams.get("trackTitle") || trackId;
    const weakNodesRaw = searchParams.get("weakNodes") || "";
    const weakNodes = weakNodesRaw ? weakNodesRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const skillGraphRaw = searchParams.get("skillGraph");

    let skillGraph = null;
    if (skillGraphRaw) {
      try {
        skillGraph = JSON.parse(decodeURIComponent(skillGraphRaw));
      } catch (e) {}
    }

    // Try Gemini AI for intelligent roadmap
    let roadmap = null;
    if (process.env.GEMINI_API_KEY && weakNodes.length > 0) {
      const patterns = getPatterns();
      const trends = getYearlyTrends().filter((t) => parseInt(t.year) >= 2024);

      const patternsContext = patterns.slice(0, 5).map((p) => `${p.pattern_name} (${p.category}): ${p.solution}`).join("\n");
      const trendsContext = trends.slice(0, 5).map((t) => `${t.topic} (${t.year}): ${t.problem_count} problems`).join("\n");

      roadmap = await generateRoadmap(trackTitle, weakNodes, patternsContext, trendsContext);
    }

    // Fallback to dataset-only roadmap
    if (!roadmap || !roadmap.days) {
      roadmap = buildRoadmapForTrack(trackId, weakNodes, skillGraph);
    }

    return NextResponse.json({ success: true, roadmap });
  } catch (error) {
    console.error("API /api/dataset/roadmap error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
