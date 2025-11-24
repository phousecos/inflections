import Airtable from "airtable";
import type {
  Brand,
  Article,
  LinkedInPost,
  Issue,
  Topic,
  ArticleStatus,
  LinkedInPostStatus,
} from "@/types";

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID!);

// Table names - update these to match your Airtable base
const TABLES = {
  BRANDS: "Brands",
  ISSUES: "Issues",
  ARTICLES: "Articles",
  LINKEDIN_POSTS: "LinkedIn Posts",
  TOPICS: "Topics Bank",
  REFERENCE_MATERIALS: "Reference Materials",
  IMAGE_ASSETS: "Image Assets",
};

// Helper to convert Airtable record to typed object
function recordToObject<T>(record: Airtable.Record<Airtable.FieldSet>): T & { id: string } {
  return {
    id: record.id,
    ...record.fields,
  } as T & { id: string };
}

// ============ BRANDS ============

export async function getBrands(): Promise<Brand[]> {
  const records = await base(TABLES.BRANDS)
    .select({
      filterByFormula: "{Is Active} = TRUE()",
      sort: [{ field: "Brand Name", direction: "asc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    name: record.get("Brand Name") as string,
    shortName: record.get("Short Name") as string,
    brandType: record.get("Brand Type") as Brand["brandType"],
    websiteUrl: record.get("Website URL") as string | undefined,
    linkedInPageUrl: record.get("LinkedIn Page URL") as string | undefined,
    linkedInPageId: record.get("LinkedIn Page ID") as string | undefined,
    primaryColor: record.get("Primary Color") as string,
    voiceSummary: record.get("Voice Summary") as string,
    voiceProfile: JSON.parse((record.get("Voice Profile JSON") as string) || "{}"),
    targetAudience: record.get("Target Audience") as string,
    contentThemes: (record.get("Content Themes") as string)?.split("\n") || [],
    crossBrandCTAs: JSON.parse((record.get("Cross-Brand CTAs") as string) || "{}"),
    logoUrl: record.get("Logo URL") as string | undefined,
    isActive: record.get("Is Active") as boolean,
  }));
}

export async function getBrand(id: string): Promise<Brand | null> {
  try {
    const record = await base(TABLES.BRANDS).find(id);
    return {
      id: record.id,
      name: record.get("Brand Name") as string,
      shortName: record.get("Short Name") as string,
      brandType: record.get("Brand Type") as Brand["brandType"],
      websiteUrl: record.get("Website URL") as string | undefined,
      linkedInPageUrl: record.get("LinkedIn Page URL") as string | undefined,
      linkedInPageId: record.get("LinkedIn Page ID") as string | undefined,
      primaryColor: record.get("Primary Color") as string,
      voiceSummary: record.get("Voice Summary") as string,
      voiceProfile: JSON.parse((record.get("Voice Profile JSON") as string) || "{}"),
      targetAudience: record.get("Target Audience") as string,
      contentThemes: (record.get("Content Themes") as string)?.split("\n") || [],
      crossBrandCTAs: JSON.parse((record.get("Cross-Brand CTAs") as string) || "{}"),
      logoUrl: record.get("Logo URL") as string | undefined,
      isActive: record.get("Is Active") as boolean,
    };
  } catch {
    return null;
  }
}

// ============ ARTICLES ============

export async function getArticles(filters?: {
  status?: ArticleStatus;
  brandId?: string;
  issueId?: string;
}): Promise<Article[]> {
  let filterFormula = "";
  const conditions: string[] = [];

  if (filters?.status) {
    conditions.push(`{Status} = "${filters.status}"`);
  }
  if (filters?.brandId) {
    conditions.push(`FIND("${filters.brandId}", ARRAYJOIN({Primary Brand}))`);
  }
  if (filters?.issueId) {
    conditions.push(`FIND("${filters.issueId}", ARRAYJOIN({Issue}))`);
  }

  if (conditions.length > 0) {
    filterFormula = conditions.length === 1 
      ? conditions[0] 
      : `AND(${conditions.join(", ")})`;
  }

  const records = await base(TABLES.ARTICLES)
    .select({
      filterByFormula: filterFormula || "",
      sort: [{ field: "Created", direction: "desc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    title: record.get("Title") as string,
    issueId: (record.get("Issue") as string[])?.[0],
    contentType: record.get("Content Type") as Article["contentType"],
    primaryBrandId: (record.get("Primary Brand") as string[])?.[0],
    secondaryBrandIds: (record.get("Secondary Brands") as string[]) || [],
    pillar: record.get("Pillar") as Article["pillar"],
    status: record.get("Status") as ArticleStatus,
    author: record.get("Author") as string | undefined,
    content: record.get("Content") as string,
    excerpt: record.get("Excerpt") as string | undefined,
    metaDescription: record.get("Meta Description") as string | undefined,
    targetWordCount: record.get("Target Word Count") as number | undefined,
    actualWordCount: record.get("Actual Word Count") as number | undefined,
    featuredImageUrl: record.get("Featured Image URL") as string | undefined,
    featuredImagePrompt: record.get("Featured Image Prompt") as string | undefined,
    publishDate: record.get("Publish Date") as string | undefined,
    publishedUrl: record.get("Published URL") as string | undefined,
    createdAt: record.get("Created") as string,
    updatedAt: record.get("Last Modified") as string,
  }));
}

export async function createArticle(article: Omit<Article, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const record = await base(TABLES.ARTICLES).create({
    "Title": article.title,
    "Issue": article.issueId ? [article.issueId] : undefined,
    "Content Type": article.contentType,
    "Primary Brand": [article.primaryBrandId],
    "Secondary Brands": article.secondaryBrandIds,
    "Pillar": article.pillar,
    "Status": article.status,
    "Content": article.content,
    "Excerpt": article.excerpt,
    "Meta Description": article.metaDescription,
    "Target Word Count": article.targetWordCount,
    "Featured Image URL": article.featuredImageUrl,
    "Featured Image Prompt": article.featuredImagePrompt,
    "Publish Date": article.publishDate,
  });

  return record.id;
}

export async function updateArticle(
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const fields: Record<string, unknown> = {};

  if (updates.title) fields["Title"] = updates.title;
  if (updates.issueId) fields["Issue"] = [updates.issueId];
  if (updates.contentType) fields["Content Type"] = updates.contentType;
  if (updates.primaryBrandId) fields["Primary Brand"] = [updates.primaryBrandId];
  if (updates.secondaryBrandIds) fields["Secondary Brands"] = updates.secondaryBrandIds;
  if (updates.pillar) fields["Pillar"] = updates.pillar;
  if (updates.status) fields["Status"] = updates.status;
  if (updates.content) fields["Content"] = updates.content;
  if (updates.excerpt) fields["Excerpt"] = updates.excerpt;
  if (updates.metaDescription) fields["Meta Description"] = updates.metaDescription;
  if (updates.featuredImageUrl) fields["Featured Image URL"] = updates.featuredImageUrl;
  if (updates.publishDate) fields["Publish Date"] = updates.publishDate;

  await base(TABLES.ARTICLES).update(id, fields);
}

// ============ LINKEDIN POSTS ============

export async function getLinkedInPosts(filters?: {
  status?: LinkedInPostStatus;
  brandId?: string;
  articleId?: string;
}): Promise<LinkedInPost[]> {
  let filterFormula = "";
  const conditions: string[] = [];

  if (filters?.status) {
    conditions.push(`{Status} = "${filters.status}"`);
  }
  if (filters?.brandId) {
    conditions.push(`FIND("${filters.brandId}", ARRAYJOIN({Brand Account}))`);
  }
  if (filters?.articleId) {
    conditions.push(`FIND("${filters.articleId}", ARRAYJOIN({Source Article}))`);
  }

  if (conditions.length > 0) {
    filterFormula = conditions.length === 1 
      ? conditions[0] 
      : `AND(${conditions.join(", ")})`;
  }

  const records = await base(TABLES.LINKEDIN_POSTS)
    .select({
      filterByFormula: filterFormula || "",
      sort: [{ field: "Scheduled Date", direction: "asc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    title: record.get("Post Title") as string,
    sourceArticleId: (record.get("Source Article") as string[])?.[0],
    postType: record.get("Post Type") as LinkedInPost["postType"],
    brandId: (record.get("Brand Account") as string[])?.[0],
    content: record.get("Content") as string,
    characterCount: (record.get("Content") as string)?.length || 0,
    hashtags: record.get("Hashtags") as string | undefined,
    linkUrl: record.get("Link URL") as string | undefined,
    imageUrl: record.get("Image URL") as string | undefined,
    status: record.get("Status") as LinkedInPostStatus,
    scheduledDate: record.get("Scheduled Date") as string | undefined,
    scheduledTime: record.get("Scheduled Time") as string | undefined,
    postedDate: record.get("Posted Date") as string | undefined,
    postUrl: record.get("Post URL") as string | undefined,
  }));
}

export async function createLinkedInPost(
  post: Omit<LinkedInPost, "id" | "characterCount">
): Promise<string> {
  const record = await base(TABLES.LINKEDIN_POSTS).create({
    "Post Title": post.title,
    "Source Article": post.sourceArticleId ? [post.sourceArticleId] : undefined,
    "Post Type": post.postType,
    "Brand Account": [post.brandId],
    "Content": post.content,
    "Hashtags": post.hashtags,
    "Link URL": post.linkUrl,
    "Image URL": post.imageUrl,
    "Status": post.status,
    "Scheduled Date": post.scheduledDate,
    "Scheduled Time": post.scheduledTime,
  });

  return record.id;
}

export async function updateLinkedInPost(
  id: string,
  updates: Partial<Omit<LinkedInPost, "id" | "characterCount">>
): Promise<void> {
  const fields: Record<string, unknown> = {};

  if (updates.title) fields["Post Title"] = updates.title;
  if (updates.content) fields["Content"] = updates.content;
  if (updates.status) fields["Status"] = updates.status;
  if (updates.scheduledDate) fields["Scheduled Date"] = updates.scheduledDate;
  if (updates.hashtags) fields["Hashtags"] = updates.hashtags;

  await base(TABLES.LINKEDIN_POSTS).update(id, fields);
}

// ============ ISSUES ============

export async function getIssues(): Promise<Issue[]> {
  const records = await base(TABLES.ISSUES)
    .select({
      sort: [{ field: "Publish Date", direction: "desc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    issueNumber: record.get("Issue Number") as number,
    title: record.get("Issue Title") as string,
    publishDate: record.get("Publish Date") as string,
    status: record.get("Status") as Issue["status"],
    themeDescription: record.get("Theme Description") as string | undefined,
    notes: record.get("Notes") as string | undefined,
  }));
}

// ============ TOPICS ============

export async function getTopics(status?: Topic["status"]): Promise<Topic[]> {
  const filterFormula = status ? `{Status} = "${status}"` : "";

  const records = await base(TABLES.TOPICS)
    .select({
      filterByFormula: filterFormula,
      sort: [{ field: "Created", direction: "desc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    topic: record.get("Topic") as string,
    description: record.get("Description") as string | undefined,
    source: record.get("Source") as Topic["source"],
    sourceUrl: record.get("Source URL") as string | undefined,
    primaryBrandId: (record.get("Primary Brand Fit") as string[])?.[0],
    secondaryBrandIds: (record.get("Secondary Brand Fit") as string[]) || [],
    pillar: record.get("Pillar") as Topic["pillar"] | undefined,
    priority: record.get("Priority") as Topic["priority"],
    timeliness: record.get("Timeliness") as Topic["timeliness"],
    status: record.get("Status") as Topic["status"],
    assignedIssueId: (record.get("Assigned to Issue") as string[])?.[0],
    notes: record.get("Notes") as string | undefined,
    createdAt: record.get("Created") as string,
  }));
}

export async function createTopic(
  topic: Omit<Topic, "id" | "createdAt">
): Promise<string> {
  const record = await base(TABLES.TOPICS).create({
    "Topic": topic.topic,
    "Description": topic.description,
    "Source": topic.source,
    "Source URL": topic.sourceUrl,
    "Primary Brand Fit": topic.primaryBrandId ? [topic.primaryBrandId] : undefined,
    "Secondary Brand Fit": topic.secondaryBrandIds,
    "Pillar": topic.pillar,
    "Priority": topic.priority,
    "Timeliness": topic.timeliness,
    "Status": topic.status,
    "Notes": topic.notes,
  });

  return record.id;
}
