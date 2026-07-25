import { NextResponse } from "next/server";
import { getPlacementBenchmarks } from "@/lib/datasetLoader";

export async function GET() {
  try {
    const benchmarks = getPlacementBenchmarks();
    return NextResponse.json({ success: true, benchmarks });
  } catch (error) {
    console.error("API /api/dataset/benchmarks error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
