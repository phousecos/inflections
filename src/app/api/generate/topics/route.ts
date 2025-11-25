import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandName, brandVoice, targetAudience, pillar, pillarDescription, count = 5 } = body;

    const prompt = `You are a content strategist helping generate article topic ideas for a business publication.

Brand: ${brandName}
Brand Voice: ${brandVoice}
Target Audience: ${targetAudience}
Content Pillar: ${pillar}
Pillar Focus: ${pillarDescription}

Generate ${count} compelling, specific article topic ideas that:
1. Are timely and relevant to current trends in ${pillar}
2. Provide actionable value to ${targetAudience}
3. Align with the brand voice: ${brandVoice}
4. Are suitable for business/professional publication
5. Address real pain points or opportunities

For each topic, provide:
- A specific, engaging topic title (not generic)
- A brief angle/hook (1-2 sentences)
- Why it matters now (timeliness)

Return ONLY a JSON array with this structure:
[
  {
    "topic": "Specific topic title here",
    "description": "Brief angle or hook for the article",
    "timeliness": "Why this topic matters right now"
  }
]

Make topics specific and actionable, not generic. Focus on emerging trends, common challenges, or underexplored angles.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    
    // Parse JSON response
    let topics;
    try {
      // Strip markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      topics = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse topics response:", responseText);
      throw new Error("Failed to parse AI response");
    }

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Failed to generate topics:", error);
    return NextResponse.json(
      {
        error: "Failed to generate topics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
