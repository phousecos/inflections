import { NextRequest, NextResponse } from "next/server";
import { getIssues, createIssue, updateIssue } from "@/lib/airtable";
import type { Issue } from "@/types";

export async function GET() {
  try {
    const issues = await getIssues();
    return NextResponse.json(issues);
  } catch (error) {
    console.error("Failed to fetch issues:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch issues",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Issue, "id"> = await request.json();
    const id = await createIssue(body);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to create issue:", error);
    return NextResponse.json(
      { 
        error: "Failed to create issue",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing issue ID" },
        { status: 400 }
      );
    }

    await updateIssue(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update issue:", error);
    return NextResponse.json(
      { 
        error: "Failed to update issue",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
