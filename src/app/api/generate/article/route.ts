import { NextRequest, NextResponse } from "next/server";
import { generateArticle } from "@/lib/ai";
import { getBrand } from "@/lib/airtable";
import type { ArticleGenerationRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ArticleGenerationRequest = await request.json();

    // Validate required fields
    if (!body.brandId || !body.topic || !body.pillar || !body.contentType) {
      return NextResponse.json(
        { error: "Missing required fields: brandId, topic, pillar, contentType" },
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

    // Generate article
    const result = await generateArticle(body, brand);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Article generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate article" },
      { status: 500 }
    );
  }
}
