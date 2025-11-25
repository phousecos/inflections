import { NextRequest, NextResponse } from "next/server";
import { getLinkedInPosts } from "@/lib/airtable";
import type { LinkedInPost } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as LinkedInPost["status"] | null;
    const brandId = searchParams.get("brandId");
    const postType = searchParams.get("postType") as LinkedInPost["postType"] | null;
    const articleId = searchParams.get("articleId");

    const filters: {
      status?: LinkedInPost["status"];
      brandId?: string;
      postType?: LinkedInPost["postType"];
      articleId?: string;
    } = {};

    if (status) filters.status = status;
    if (brandId) filters.brandId = brandId;
    if (postType) filters.postType = postType;
    if (articleId) filters.articleId = articleId;

    const posts = await getLinkedInPosts(Object.keys(filters).length > 0 ? filters : undefined);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch LinkedIn posts:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch LinkedIn posts",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
