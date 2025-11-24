import { NextRequest, NextResponse } from "next/server";
import { getTopics, createTopic, updateTopic, deleteTopic } from "@/lib/airtable";
import type { Topic } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as Topic["status"] | null;
    const priority = searchParams.get("priority") as Topic["priority"] | null;
    const brandId = searchParams.get("brandId");
    const pillar = searchParams.get("pillar") as Topic["pillar"] | null;

    const filters: {
      status?: Topic["status"];
      priority?: Topic["priority"];
      brandId?: string;
      pillar?: Topic["pillar"];
    } = {};

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (brandId) filters.brandId = brandId;
    if (pillar) filters.pillar = pillar;

    const topics = await getTopics(Object.keys(filters).length > 0 ? filters : undefined);
    return NextResponse.json(topics);
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch topics",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Topic, "id" | "createdAt"> = await request.json();
    const id = await createTopic(body);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to create topic:", error);
    return NextResponse.json(
      { 
        error: "Failed to create topic",
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
        { error: "Missing topic ID" },
        { status: 400 }
      );
    }

    await updateTopic(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update topic:", error);
    return NextResponse.json(
      { 
        error: "Failed to update topic",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing topic ID" },
        { status: 400 }
      );
    }

    await deleteTopic(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete topic:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete topic",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
