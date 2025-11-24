import { NextRequest, NextResponse } from "next/server";
import { createArticle, createLinkedInPost } from "@/lib/airtable";
import type { Article, LinkedInPost } from "@/types";

interface PushRequest {
  article: Omit<Article, "id" | "createdAt" | "updatedAt">;
  linkedInPosts: Array<Omit<LinkedInPost, "id" | "characterCount">>;
}

export async function POST(request: NextRequest) {
  try {
    const body: PushRequest = await request.json();

    // Create article in Airtable
    const articleId = await createArticle(body.article);

    // Create LinkedIn posts linked to article
    const linkedInPostIds: string[] = [];
    for (const post of body.linkedInPosts) {
      const postId = await createLinkedInPost({
        ...post,
        sourceArticleId: articleId,
      });
      linkedInPostIds.push(postId);
    }

    return NextResponse.json({
      success: true,
      articleId,
      linkedInPostIds,
    });
  } catch (error) {
    console.error("Airtable push error:", error);
    return NextResponse.json(
      { error: "Failed to push content to Airtable" },
      { status: 500 }
    );
  }
}
