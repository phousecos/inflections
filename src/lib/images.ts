import type { Brand } from "@/types";

interface ImageGenerationOptions {
  title: string;
  excerpt: string;
  brand: Brand;
  style?: "professional" | "abstract" | "editorial" | "conceptual";
}

interface GeneratedImage {
  url: string;
  prompt: string;
}

// Build an image prompt based on article content
function buildImagePrompt(options: ImageGenerationOptions): string {
  const { title, excerpt, brand, style = "professional" } = options;

  const baseStyle = {
    professional: "Professional photography style, modern office or technology environment, clean and polished, natural lighting, editorial quality",
    abstract: "Abstract conceptual art, geometric shapes, modern design, bold colors, minimalist composition",
    editorial: "Editorial magazine photography, sophisticated composition, lifestyle business imagery, warm tones",
    conceptual: "Conceptual illustration, metaphorical imagery, thought-provoking visual, artistic interpretation",
  };

  // Extract key concepts from title/excerpt for imagery
  const concepts = extractKeyConcepts(title, excerpt);

  return `${baseStyle[style]}. 

Subject: ${concepts}

Color palette: Professional blues and neutral tones${brand.primaryColor ? `, accent of ${brand.primaryColor}` : ""}.

Technical requirements: High resolution, suitable for web header image, 16:9 aspect ratio, no text or watermarks.

Style: Clean, modern, trustworthy. Avoid: stock photo clichés, obvious AI artifacts, unrealistic elements.`;
}

// Extract key visual concepts from text
function extractKeyConcepts(title: string, excerpt: string): string {
  // Simple keyword extraction - could be enhanced with AI
  const combinedText = `${title} ${excerpt}`.toLowerCase();
  
  const conceptMappings: Record<string, string> = {
    "disaster recovery": "server room with backup systems, data protection visualization",
    "business continuity": "resilient infrastructure, connected systems",
    "leadership": "confident professional in modern workspace",
    "project management": "organized workflow, collaborative team environment",
    "pmo": "strategic planning visualization, project dashboards",
    "hiring": "diverse professional team, interview setting",
    "interview": "professional conversation, career growth",
    "women in tech": "confident woman professional in technology environment",
    "ai": "artificial intelligence visualization, neural networks, modern technology",
    "digital transformation": "modern technology adoption, innovation",
    "career": "professional growth, career pathway",
    "compliance": "organized documentation, structured processes",
    "data center": "modern data center infrastructure, servers",
    "cloud": "cloud computing visualization, connected infrastructure",
    "security": "cybersecurity, protected systems",
    "team": "collaborative professionals working together",
    "strategy": "strategic planning, business vision",
  };

  for (const [keyword, concept] of Object.entries(conceptMappings)) {
    if (combinedText.includes(keyword)) {
      return concept;
    }
  }

  // Default fallback
  return "modern professional technology environment, business innovation";
}

// Generate image using Replicate (Flux model)
export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
  const prompt = buildImagePrompt(options);

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({
      // Flux Schnell - fast, high quality
      version: "black-forest-labs/flux-schnell",
      input: {
        prompt: prompt,
        num_outputs: 1,
        aspect_ratio: "16:9",
        output_format: "webp",
        output_quality: 90,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Image generation failed: ${error.detail || response.statusText}`);
  }

  const prediction = await response.json();

  // If using "Prefer: wait", the response should include the output
  if (prediction.output && prediction.output.length > 0) {
    return {
      url: prediction.output[0],
      prompt: prompt,
    };
  }

  // If we need to poll for the result
  if (prediction.status === "starting" || prediction.status === "processing") {
    return await pollForResult(prediction.id, prompt);
  }

  throw new Error("Unexpected response from image generation API");
}

// Poll for image generation result
async function pollForResult(predictionId: string, prompt: string): Promise<GeneratedImage> {
  const maxAttempts = 30;
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          "Authorization": `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check prediction status: ${response.statusText}`);
    }

    const prediction = await response.json();

    if (prediction.status === "succeeded" && prediction.output?.length > 0) {
      return {
        url: prediction.output[0],
        prompt: prompt,
      };
    }

    if (prediction.status === "failed") {
      throw new Error(`Image generation failed: ${prediction.error}`);
    }
  }

  throw new Error("Image generation timed out");
}

// Generate multiple image options
export async function generateImageOptions(
  options: ImageGenerationOptions,
  count: number = 3
): Promise<GeneratedImage[]> {
  const styles: Array<"professional" | "abstract" | "editorial" | "conceptual"> = [
    "professional",
    "editorial",
    "conceptual",
  ];

  const results: GeneratedImage[] = [];

  for (let i = 0; i < Math.min(count, styles.length); i++) {
    try {
      const image = await generateImage({
        ...options,
        style: styles[i],
      });
      results.push(image);
    } catch (error) {
      console.error(`Failed to generate ${styles[i]} style image:`, error);
    }
  }

  return results;
}

// Suggest an image prompt based on article content (without generating)
export function suggestImagePrompt(options: ImageGenerationOptions): string {
  return buildImagePrompt(options);
}
