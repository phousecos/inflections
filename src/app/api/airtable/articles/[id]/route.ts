import { NextRequest, NextResponse } from "next/server";
import { updateArticle } from "@/lib/airtable";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    await updateArticle(params.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update article:", error);
    return NextResponse.json(
      { 
        error: "Failed to update article",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
