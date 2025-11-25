import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/airtable";
import type { Article } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as Article["status"] | null;
    const brandId = searchParams.get("brandId");
    const pillar = searchParams.get("pillar") as Article["pillar"] | null;
    const contentType = searchParams.get("contentType") as Article["contentType"] | null;

    const filters: {
      status?: Article["status"];
      brandId?: string;
      pillar?: Article["pillar"];
      contentType?: Article["contentType"];
    } = {};

    if (status) filters.status = status;
    if (brandId) filters.brandId = brandId;
    if (pillar) filters.pillar = pillar;
    if (contentType) filters.contentType = contentType;

    const articles = await getArticles(Object.keys(filters).length > 0 ? filters : undefined);
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch articles",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
