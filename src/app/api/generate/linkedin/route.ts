import { NextRequest, NextResponse } from "next/server";
import { generateLinkedInPosts } from "@/lib/ai";
import { getBrand } from "@/lib/airtable";
import type { LinkedInGenerationRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: LinkedInGenerationRequest = await request.json();

    // Validate required fields
    if (!body.brandId || !body.articleContent || !body.articleTitle) {
      return NextResponse.json(
        { error: "Missing required fields: brandId, articleContent, articleTitle" },
        { status: 400 }
      );
    }

    // Get brand details
    const brand = await getBrand(body.brandId);
    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Generate LinkedIn posts
    const result = await generateLinkedInPosts(body, brand);

    return NextResponse.json(result);
  } catch (error) {
    console.error("LinkedIn generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate LinkedIn posts" },
      { status: 500 }
    );
  }
}
