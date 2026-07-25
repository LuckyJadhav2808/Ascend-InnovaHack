import { NextResponse } from "next/server";
import { getAvailableTracks } from "@/lib/datasetLoader";

export async function GET() {
  try {
    const tracks = getAvailableTracks();
    return NextResponse.json({ success: true, tracks });
  } catch (error) {
    console.error("API /api/dataset/tracks error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
