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
    let articleId: string;
    try {
      articleId = await createArticle(body.article);
    } catch (articleError) {
      console.error("Article creation error:", articleError);
      return NextResponse.json(
        { 
          error: "Failed to create article", 
          details: articleError instanceof Error ? articleError.message : String(articleError)
        },
        { status: 500 }
      );
    }

    // Create LinkedIn posts linked to article
    const linkedInPostIds: string[] = [];
    for (const post of body.linkedInPosts) {
      try {
        const postId = await createLinkedInPost({
          ...post,
          sourceArticleId: articleId,
        });
        linkedInPostIds.push(postId);
      } catch (postError) {
        console.error("LinkedIn post creation error:", postError);
        // Continue with other posts, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      articleId,
      linkedInPostIds,
    });
  } catch (error) {
    console.error("Airtable push error:", error);
    return NextResponse.json(
      { 
        error: "Failed to push content to Airtable",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
