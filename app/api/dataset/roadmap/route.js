import { NextResponse } from "next/server";
import { buildRoadmapForTrack, getPatterns, getAntiPatterns, getYearlyTrends } from "@/lib/datasetLoader";
import { generateRoadmap } from "@/lib/geminiClient";

export const dynamic = "force-dynamic";

async function handleRoadmapRequest(params) {
  const { trackId = "sde-backend", trackTitle = trackId, weakNodes = [], skillGraph = null } = params;

  let roadmap = null;
  if ((process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY) && weakNodes.length > 0) {
    const patterns = getPatterns();
    const trends = getYearlyTrends().filter((t) => parseInt(t.year) >= 2024);

    const patternsContext = patterns.slice(0, 5).map((p) => `${p.pattern_name} (${p.category}): ${p.solution}`).join("\n");
    const trendsContext = trends.slice(0, 5).map((t) => `${t.topic} (${t.year}): ${t.problem_count} problems`).join("\n");

    roadmap = await generateRoadmap(trackTitle, weakNodes, patternsContext, trendsContext);
  }

  if (!roadmap || !roadmap.days) {
    roadmap = buildRoadmapForTrack(trackId, weakNodes, skillGraph);
  }

  return roadmap;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { track = "sde-backend", trackTitle, weakNodes = [], skillGraph = null } = body;
    const roadmap = await handleRoadmapRequest({
      trackId: track,
      trackTitle: trackTitle || track,
      weakNodes,
      skillGraph
    });
    return NextResponse.json({ success: true, roadmap });
  } catch (error) {
    console.error("API /api/dataset/roadmap POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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

    const roadmap = await handleRoadmapRequest({ trackId, trackTitle, weakNodes, skillGraph });
    return NextResponse.json({ success: true, roadmap });
  } catch (error) {
    console.error("API /api/dataset/roadmap GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
