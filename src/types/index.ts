// Brand types
export interface Brand {
  id: string;
  name: string;
  shortName: string;
  brandType: "service" | "personal" | "nonprofit" | "product";
  websiteUrl?: string;
  linkedInPageUrl?: string;
  linkedInPageId?: string;
  primaryColor: string;
  voiceSummary: string;
  voiceProfile: VoiceProfile;
  targetAudience: string;
  contentThemes: string[];
  crossBrandCTAs: Record<string, string>;
  logoUrl?: string;
  isActive: boolean;
}

export interface VoiceProfile {
  tone: string[];
  personality: string;
  vocabulary: {
    preferred: string[];
    avoid: string[];
  };
  sentenceStyle: string;
  formattingPreferences: {
    useHeaders: boolean;
    useBullets: "freely" | "sparingly" | "never";
    paragraphLength: "short" | "medium" | "long";
    ctaStyle: string;
  };
  examplePhrases: string[];
}

// Content types
export type ContentType =
  | "feature"
  | "perspective"
  | "practitioner_guide"
  | "spotlight"
  | "the_crossroads"
  | "resource_roundup";

export type ContentPillar =
  | "tech_leadership"
  | "delivery_excellence"
  | "workforce_transformation"
  | "emerging_talent"
  | "human_side";

export type ArticleStatus =
  | "idea"
  | "drafting"
  | "in_review"
  | "approved"
  | "scheduled"
  | "published";

export type LinkedInPostType =
  | "hot_take"
  | "article_share"
  | "quote_graphic"
  | "poll"
  | "thread";

export type LinkedInPostStatus =
  | "draft"
  | "approved"
  | "scheduled"
  | "posted";

// Issue
export interface Issue {
  id: string;
  issueNumber: number;
  title: string;
  publishDate: string;
  status: "planning" | "in_production" | "ready" | "published";
  themeDescription?: string;
  notes?: string;
}

// Article
export interface Article {
  id: string;
  title: string;
  issueId?: string;
  contentType: ContentType;
  primaryBrandId: string;
  secondaryBrandIds: string[];
  pillar: ContentPillar;
  status: ArticleStatus;
  author?: string;
  content: string;
  excerpt?: string;
  metaDescription?: string;
  targetWordCount?: number;
  actualWordCount?: number;
  featuredImageUrl?: string;
  featuredImagePrompt?: string;
  publishDate?: string;
  publishedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// LinkedIn Post
export interface LinkedInPost {
  id: string;
  title: string;
  sourceArticleId?: string;
  postType: LinkedInPostType;
  brandId: string;
  content: string;
  characterCount: number;
  hashtags?: string;
  linkUrl?: string;
  imageUrl?: string;
  status: LinkedInPostStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  postedDate?: string;
  postUrl?: string;
}

// Topic
export interface Topic {
  id: string;
  topic: string;
  description?: string;
  source: "ai_suggested" | "manual" | "news" | "reference_material";
  sourceUrl?: string;
  primaryBrandId?: string;
  secondaryBrandIds: string[];
  pillar?: ContentPillar;
  priority: "high" | "medium" | "low";
  timeliness: "evergreen" | "timely" | "dated";
  status: "new" | "approved" | "assigned" | "used" | "rejected";
  assignedIssueId?: string;
  notes?: string;
  createdAt: string;
}

// Generation request/response types
export interface ArticleGenerationRequest {
  brandId: string;
  pillar: ContentPillar;
  contentType: ContentType;
  topic: string;
  angle?: string;
  referenceUrl?: string;
  additionalContext?: string;
  targetWordCount?: number;
}

export interface ArticleGenerationResponse {
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  suggestedTags: string[];
  crossBrandSuggestion?: {
    brandId: string;
    ctaText: string;
  };
}

export interface LinkedInGenerationRequest {
  articleContent: string;
  articleTitle: string;
  brandId: string;
  postTypes: LinkedInPostType[];
}

export interface LinkedInGenerationResponse {
  posts: Array<{
    type: LinkedInPostType;
    content: string;
    hashtags: string[];
  }>;
}

export interface ImageGenerationRequest {
  articleTitle: string;
  articleExcerpt: string;
  brandId: string;
  style?: "professional" | "abstract" | "editorial";
}

export interface ImageGenerationResponse {
  imageUrl: string;
  prompt: string;
}

// Airtable record types (for API responses)
export interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

// UI State types
export interface GenerationStep {
  step: "setup" | "generating" | "editing" | "derivatives" | "image" | "push";
  isComplete: boolean;
}

export interface EditorState {
  content: string;
  wordCount: number;
  lastSaved?: Date;
  isDirty: boolean;
}
