import Anthropic from "@anthropic-ai/sdk";
import type {
  Brand,
  ContentType,
  ContentPillar,
  ArticleGenerationRequest,
  ArticleGenerationResponse,
  LinkedInGenerationRequest,
  LinkedInGenerationResponse,
} from "@/types";
import { wordCountTargets, contentTypeLabels, pillarLabels } from "./utils";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt for article generation
function buildArticleSystemPrompt(brand: Brand, contentType: ContentType): string {
  const wordTarget = wordCountTargets[contentType];
  const voiceProfile = brand.voiceProfile;

  return `You are a content writer for Inflections, a digital publication covering technology leadership, workforce transformation, and human-centered innovation. The publication is led by Jerri Bland, an experienced IT leader and consultant with 20 years in higher education, healthcare, and government IT.

WRITING GUIDELINES:
- Write in a warm, human voice that sounds like an experienced practitioner sharing insights
- Avoid corporate jargon and buzzwords (no "synergy," "leverage," "circle back," "low-hanging fruit")
- Lead with practical value, not theory
- Use real-world examples and scenarios
- Include actionable takeaways
- Keep paragraphs to 3-5 sentences max
- Use markdown headers (##) to break up content
- Write for smart professionals who are busy

CURRENT BRAND: ${brand.name}

VOICE PROFILE:
- Tone: ${voiceProfile.tone?.join(", ") || "clear, confident, human-first"}
- Personality: ${voiceProfile.personality || "A trusted strategic partner who simplifies complexity"}
- Preferred vocabulary: ${voiceProfile.vocabulary?.preferred?.join(", ") || "guide, empower, clarity, strategic, dependable"}
- Avoid: ${voiceProfile.vocabulary?.avoid?.join(", ") || "synergy, leverage, circle back, low-hanging fruit"}
- Style: ${voiceProfile.sentenceStyle || "Mix of short punchy sentences and flowing explanations. Lead with value."}

TARGET AUDIENCE: ${brand.targetAudience || "IT leaders, project managers, and technology professionals"}

CONTENT TYPE: ${contentTypeLabels[contentType]}
Target word count: ${wordTarget.min}-${wordTarget.max} words

${contentType === "feature" ? "This is a deep dive with research and examples. Be thorough but engaging." : ""}
${contentType === "perspective" ? "This is an opinion piece or lessons learned. Be personal and opinionated." : ""}
${contentType === "practitioner_guide" ? "This is a how-to guide. Be practical with actionable steps." : ""}
${contentType === "spotlight" ? "This can be Q&A or profile format. Be conversational." : ""}
${contentType === "the_crossroads" ? "This is a quick take on news/trends. Be punchy and timely." : ""}
${contentType === "resource_roundup" ? "This is a curated list with commentary. Be helpful and concise." : ""}

CROSS-BRAND INTEGRATION:
When naturally relevant (never forced), you may include ONE soft reference to related services. Position it as helpful context, not advertisement.

OUTPUT FORMAT:
Return your response as JSON with this structure:
{
  "title": "Compelling, specific headline (not clickbait)",
  "content": "Full article with markdown formatting",
  "excerpt": "2-3 sentence summary for previews",
  "metaDescription": "Under 155 characters for SEO",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "crossBrandSuggestion": {
    "brandId": "optional brand ID if relevant",
    "ctaText": "soft call-to-action text"
  }
}`;
}

// System prompt for LinkedIn generation
function buildLinkedInSystemPrompt(brand: Brand): string {
  const voiceProfile = brand.voiceProfile;

  return `You are creating LinkedIn content for Inflections magazine. The posts should sound like Jerri Bland - an experienced IT leader who is warm, direct, and genuinely helpful.

BRAND: ${brand.name}
VOICE: ${voiceProfile.tone?.join(", ") || "clear, confident, approachable"}

LINKEDIN BEST PRACTICES:
- First line must hook attention (question, bold statement, relatable scenario)
- Deliver value IN the post, not just "click to learn more"
- Use line breaks for readability
- Keep under 1,300 characters for optimal engagement
- End with soft CTA or thought-provoking question
- Hashtags: 3-5 max, placed at end

AVOID:
- "I'm excited to announce..."
- "Check out my latest blog post..."
- Starting with "In today's fast-paced world..."
- Excessive emojis
- Obviously AI-generated phrases
- Sounding like a press release

POST TYPES TO GENERATE:
1. Hot Take - Strong opinion on the topic, drives discussion
2. Article Share - Highlights key insight, teases the full piece
3. Quote/Insight - One powerful idea from the article, simple and shareable

OUTPUT FORMAT:
Return your response as JSON:
{
  "posts": [
    {
      "type": "hot_take",
      "content": "The post text with line breaks",
      "hashtags": ["hashtag1", "hashtag2"]
    },
    {
      "type": "article_share",
      "content": "...",
      "hashtags": ["..."]
    },
    {
      "type": "quote_graphic",
      "content": "...",
      "hashtags": ["..."]
    }
  ]
}`;
}

// Generate article content
export async function generateArticle(
  request: ArticleGenerationRequest,
  brand: Brand
): Promise<ArticleGenerationResponse> {
  const systemPrompt = buildArticleSystemPrompt(brand, request.contentType);

  const userPrompt = `Write an article about: ${request.topic}

${request.angle ? `Angle/Hook: ${request.angle}` : ""}
${request.referenceUrl ? `Reference URL for context: ${request.referenceUrl}` : ""}
${request.additionalContext ? `Additional context: ${request.additionalContext}` : ""}

Pillar: ${pillarLabels[request.pillar]}

Remember to return valid JSON only.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  // Extract text content
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }

  // Parse JSON response
  try {
    // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonStr = textContent.text;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    return JSON.parse(jsonStr) as ArticleGenerationResponse;
  } catch (error) {
    console.error("Failed to parse article response:", textContent.text);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// Generate LinkedIn posts from article
export async function generateLinkedInPosts(
  request: LinkedInGenerationRequest,
  brand: Brand
): Promise<LinkedInGenerationResponse> {
  const systemPrompt = buildLinkedInSystemPrompt(brand);

  const userPrompt = `Based on this article, create LinkedIn posts:

ARTICLE TITLE: ${request.articleTitle}

ARTICLE CONTENT:
${request.articleContent}

Generate 3 different LinkedIn posts (hot_take, article_share, and quote_graphic types).

Remember to return valid JSON only.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  // Extract text content
  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }

  // Parse JSON response
  try {
    let jsonStr = textContent.text;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    return JSON.parse(jsonStr) as LinkedInGenerationResponse;
  } catch (error) {
    console.error("Failed to parse LinkedIn response:", textContent.text);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// Generate topic ideas
export async function generateTopicIdeas(
  brandIds: string[],
  brands: Brand[],
  context?: { newsUrl?: string; theme?: string }
): Promise<Array<{ topic: string; description: string; brandId: string; pillar: ContentPillar }>> {
  const selectedBrands = brands.filter((b) => brandIds.includes(b.id));
  const brandContext = selectedBrands
    .map((b) => `- ${b.name}: ${b.targetAudience}. Themes: ${b.contentThemes?.join(", ")}`)
    .join("\n");

  const systemPrompt = `You are a content strategist for Inflections, a digital publication by Jerri Bland covering technology leadership, workforce transformation, and innovation.

Generate topic ideas that:
- Are timely and relevant
- Position the brand as a thought leader
- Solve real problems for the target audience
- Have potential for engagement and sharing

BRANDS TO CONSIDER:
${brandContext}

CONTENT PILLARS:
- tech_leadership: IT strategy, digital transformation, CIO topics
- delivery_excellence: PMO, project management, execution
- workforce_transformation: Hiring, talent, career development
- emerging_talent: Youth workforce, new professionals, AI skills
- human_side: Leadership, culture, work-life topics

OUTPUT FORMAT:
Return JSON array:
[
  {
    "topic": "Topic title",
    "description": "2-3 sentence description of what this would cover",
    "brandId": "ID of the best-fit brand",
    "pillar": "one of the pillar keys above"
  }
]`;

  const userPrompt = `Generate 5-7 topic ideas for upcoming content.

${context?.newsUrl ? `Consider this news/reference: ${context.newsUrl}` : ""}
${context?.theme ? `Theme direction: ${context.theme}` : ""}

Focus on practical, valuable content that positions Jerri as a trusted expert.

Return valid JSON only.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: systemPrompt,
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }

  try {
    let jsonStr = textContent.text;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse topics response:", textContent.text);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// Refine/edit content with AI assistance
export async function refineContent(
  content: string,
  instruction: string,
  brand: Brand
): Promise<string> {
  const systemPrompt = `You are an editor for Inflections magazine. Make the requested changes while maintaining the brand voice.

BRAND: ${brand.name}
VOICE: ${brand.voiceProfile.tone?.join(", ") || "clear, confident, human-first"}

Return only the revised content, no explanations.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `INSTRUCTION: ${instruction}

CONTENT TO EDIT:
${content}`,
      },
    ],
    system: systemPrompt,
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text content in response");
  }

  return textContent.text;
}
