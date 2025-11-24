import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ContentType, ContentPillar, ArticleStatus, LinkedInPostType } from "@/types";

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Word count utility
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

// Reading time estimate (average 200 words per minute)
export function estimateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

// Character count for LinkedIn
export function countCharacters(text: string): number {
  return text.length;
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// Content type display labels
export const contentTypeLabels: Record<ContentType, string> = {
  feature: "Feature",
  perspective: "Perspective",
  practitioner_guide: "Practitioner Guide",
  spotlight: "Spotlight",
  the_crossroads: "The Crossroads",
  resource_roundup: "Resource Roundup",
};

// Content pillar display labels
export const pillarLabels: Record<ContentPillar, string> = {
  tech_leadership: "Technology Leadership",
  delivery_excellence: "Delivery Excellence",
  workforce_transformation: "Workforce Transformation",
  emerging_talent: "Emerging Talent",
  human_side: "The Human Side",
};

// Article status display labels and colors
export const articleStatusConfig: Record<
  ArticleStatus,
  { label: string; color: string; bgColor: string }
> = {
  idea: { label: "Idea", color: "text-gray-600", bgColor: "bg-gray-100" },
  drafting: { label: "Drafting", color: "text-blue-600", bgColor: "bg-blue-50" },
  in_review: { label: "In Review", color: "text-amber-600", bgColor: "bg-amber-50" },
  approved: { label: "Approved", color: "text-green-600", bgColor: "bg-green-50" },
  scheduled: { label: "Scheduled", color: "text-purple-600", bgColor: "bg-purple-50" },
  published: { label: "Published", color: "text-emerald-600", bgColor: "bg-emerald-50" },
};

// LinkedIn post type labels
export const linkedInPostTypeLabels: Record<LinkedInPostType, string> = {
  hot_take: "Hot Take",
  article_share: "Article Share",
  quote_graphic: "Quote Graphic",
  poll: "Poll",
  thread: "Thread",
};

// Word count targets by content type
export const wordCountTargets: Record<ContentType, { min: number; max: number }> = {
  feature: { min: 1200, max: 2000 },
  perspective: { min: 600, max: 900 },
  practitioner_guide: { min: 800, max: 1200 },
  spotlight: { min: 1000, max: 1500 },
  the_crossroads: { min: 400, max: 600 },
  resource_roundup: { min: 300, max: 500 },
};

// Generate a slug from title
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Strip HTML tags for plain text
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

// Extract first paragraph for excerpt
export function extractExcerpt(content: string, maxLength: number = 200): string {
  const stripped = stripHtml(content);
  const firstParagraph = stripped.split(/\n\n/)[0] || stripped;
  return truncate(firstParagraph, maxLength);
}
