import { NextResponse } from "next/server";
import { getBrands } from "@/lib/airtable";

export async function GET() {
  try {
    const brands = await getBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
