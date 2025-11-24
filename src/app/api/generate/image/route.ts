import { NextRequest, NextResponse } from "next/server";

interface ImageRequest {
  prompt: string;
  articleTitle: string;
  brandName: string;
  style?: "professional" | "abstract" | "editorial";
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not configured" },
        { status: 500 }
      );
    }

    const body: ImageRequest = await request.json();
    
    // Build a rich prompt for Flux
    const styleGuide = {
      professional: "professional photography style, clean lighting, corporate aesthetic, high-end editorial look",
      abstract: "abstract conceptual art, modern graphic design, bold colors, minimalist composition",
      editorial: "editorial magazine photography, sophisticated, thoughtful composition, natural lighting"
    };

    const enhancedPrompt = `${body.prompt}. ${styleGuide[body.style || "editorial"]}. No text or words in the image. High quality, 16:9 aspect ratio.`;

    // Call Replicate API with Flux model
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait" // Wait for the result instead of polling
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell", // Fast, good quality
        input: {
          prompt: enhancedPrompt,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "webp",
          output_quality: 90
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Replicate API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate image", details: errorData },
        { status: 500 }
      );
    }

    const prediction = await response.json();

    // If using "Prefer: wait", the output should be ready
    // Otherwise we'd need to poll prediction.urls.get
    if (prediction.status === "succeeded" && prediction.output) {
      return NextResponse.json({
        success: true,
        imageUrl: Array.isArray(prediction.output) ? prediction.output[0] : prediction.output,
        prompt: enhancedPrompt
      });
    }

    // If still processing, return the prediction ID for polling
    if (prediction.status === "starting" || prediction.status === "processing") {
      return NextResponse.json({
        success: true,
        status: "processing",
        predictionId: prediction.id,
        getUrl: prediction.urls?.get
      });
    }

    // Handle failure
    return NextResponse.json(
      { error: "Image generation failed", details: prediction.error },
      { status: 500 }
    );

  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check prediction status (for polling if needed)
export async function GET(request: NextRequest) {
  const predictionId = request.nextUrl.searchParams.get("id");
  
  if (!predictionId) {
    return NextResponse.json({ error: "Missing prediction ID" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      }
    });

    const prediction = await response.json();

    return NextResponse.json({
      status: prediction.status,
      imageUrl: prediction.status === "succeeded" 
        ? (Array.isArray(prediction.output) ? prediction.output[0] : prediction.output)
        : null,
      error: prediction.error
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check prediction status" },
      { status: 500 }
    );
  }
}
