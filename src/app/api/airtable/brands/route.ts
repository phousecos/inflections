import { NextResponse } from "next/server";
import { getBrands } from "@/lib/airtable";

export async function GET() {
  try {
    // Check if env vars are set
    if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "AIRTABLE_PERSONAL_ACCESS_TOKEN is not set" },
        { status: 500 }
      );
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: "AIRTABLE_BASE_ID is not set" },
        { status: 500 }
      );
    }

    const brands = await getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch brands", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
