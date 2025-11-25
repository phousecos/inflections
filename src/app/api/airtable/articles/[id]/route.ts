import { NextRequest, NextResponse } from "next/server";
import { updateArticle } from "@/lib/airtable";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    
    console.log("Updating article:", params.id, body);
    
    await updateArticle(params.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update article:", error);
    
    // Extract Airtable-specific error details
    let errorDetails = error instanceof Error ? error.message : String(error);
    if (error && typeof error === 'object' && 'error' in error) {
      errorDetails = JSON.stringify(error);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to update article",
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
