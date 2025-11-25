import { NextRequest, NextResponse } from "next/server";
import { updateLinkedInPost } from "@/lib/airtable";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    await updateLinkedInPost(params.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update LinkedIn post:", error);
    return NextResponse.json(
      { 
        error: "Failed to update LinkedIn post",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
