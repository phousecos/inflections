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
import { contentTypeToAirtable, pillarToAirtable, statusToAirtable, linkedInPostTypeToAirtable, linkedInStatusToAirtable, topicSourceToAirtable, topicPriorityToAirtable, topicTimelinessToAirtable, topicStatusToAirtable } from "./utils";

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
    brandType: mapBrandType(record.get("Brand Type") as string),
    websiteUrl: record.get("Website") as string | undefined,
    linkedInPageUrl: record.get("LinkedIn Page URL") as string | undefined,
    linkedInPageId: record.get("LinkedIn Page ID") as string | undefined,
    primaryColor: record.get("Primary Color") as string,
    voiceSummary: record.get("Voice Summary") as string,
    voiceProfile: parseVoiceProfile(record.get("Voice Profile JSON") as string),
    targetAudience: record.get("Target Audience") as string,
    contentThemes: parseContentThemes(record.get("Content Themes") as string),
    crossBrandCTAs: parseCrossBrandCTAs(record.get("Cross-Brand CTAs") as string),
    logoUrl: record.get("Logo URL") as string | undefined,
    isActive: record.get("Is Active") as boolean,
  }));
}

// Helper to map Airtable brand type values to code values
function mapBrandType(type: string): Brand["brandType"] {
  const mapping: Record<string, Brand["brandType"]> = {
    "Service Brand": "service",
    "Personal Brand": "personal",
    "Non-Profit": "nonprofit",
    "Product": "product",
  };
  return mapping[type] || "service";
}

// Helper to safely parse Voice Profile JSON
function parseVoiceProfile(json: string | undefined): Brand["voiceProfile"] {
  if (!json) {
    return {
      tone: ["clear", "confident", "human-first"],
      personality: "",
      vocabulary: { preferred: [], avoid: [] },
      sentenceStyle: "",
      formattingPreferences: {
        useHeaders: true,
        useBullets: "sparingly",
        paragraphLength: "medium",
        ctaStyle: "soft and value-focused",
      },
      examplePhrases: [],
    };
  }
  try {
    return JSON.parse(json);
  } catch {
    return {
      tone: ["clear", "confident", "human-first"],
      personality: "",
      vocabulary: { preferred: [], avoid: [] },
      sentenceStyle: "",
      formattingPreferences: {
        useHeaders: true,
        useBullets: "sparingly",
        paragraphLength: "medium",
        ctaStyle: "soft and value-focused",
      },
      examplePhrases: [],
    };
  }
}

// Helper to parse Content Themes (newline or comma separated)
function parseContentThemes(themes: string | undefined): string[] {
  if (!themes) return [];
  return themes.split(/[\n,]/).map((t) => t.trim()).filter(Boolean);
}

// Helper to parse Cross-Brand CTAs JSON
function parseCrossBrandCTAs(json: string | undefined): Record<string, string> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export async function getBrand(id: string): Promise<Brand | null> {
  try {
    const record = await base(TABLES.BRANDS).find(id);
    return {
      id: record.id,
      name: record.get("Brand Name") as string,
      shortName: record.get("Short Name") as string,
      brandType: mapBrandType(record.get("Brand Type") as string),
      websiteUrl: record.get("Website") as string | undefined,
      linkedInPageUrl: record.get("LinkedIn Page URL") as string | undefined,
      linkedInPageId: record.get("LinkedIn Page ID") as string | undefined,
      primaryColor: record.get("Primary Color") as string,
      voiceSummary: record.get("Voice Summary") as string,
      voiceProfile: parseVoiceProfile(record.get("Voice Profile JSON") as string),
      targetAudience: record.get("Target Audience") as string,
      contentThemes: parseContentThemes(record.get("Content Themes") as string),
      crossBrandCTAs: parseCrossBrandCTAs(record.get("Cross-Brand CTAs") as string),
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
  pillar?: Article["pillar"];
  contentType?: Article["contentType"];
}): Promise<Article[]> {
  let filterFormula = "";
  const conditions: string[] = [];

  if (filters?.status) {
    conditions.push(`{Status} = "${statusToAirtable[filters.status]}"`);
  }
  if (filters?.brandId) {
    conditions.push(`FIND("${filters.brandId}", ARRAYJOIN({Primary Brand}))`);
  }
  if (filters?.issueId) {
    conditions.push(`FIND("${filters.issueId}", ARRAYJOIN({Issue}))`);
  }
  if (filters?.pillar) {
    conditions.push(`{Pillar} = "${pillarToAirtable[filters.pillar]}"`);
  }
  if (filters?.contentType) {
    conditions.push(`{Content Type} = "${contentTypeToAirtable[filters.contentType]}"`);
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

  // Helper to map Airtable values back to internal values
  const mapAirtableToContentType = (value: string): Article["contentType"] => {
    const mapping: Record<string, Article["contentType"]> = {
      "Feature": "feature",
      "Perspective": "perspective",
      "Practitioner Guide": "practitioner_guide",
      "Spotlight": "spotlight",
      "The Crossroads": "the_crossroads",
      "Resource Roundup": "resource_roundup",
    };
    return mapping[value] || "perspective";
  };

  const mapAirtableToPillar = (value: string): Article["pillar"] => {
    const mapping: Record<string, Article["pillar"]> = {
      "Tech Leadership": "tech_leadership",
      "Delivery Excellence": "delivery_excellence",
      "Workforce Transformation": "workforce_transformation",
      "Emerging Talent": "emerging_talent",
      "Human Side": "human_side",
    };
    return mapping[value] || "tech_leadership";
  };

  const mapAirtableToStatus = (value: string): ArticleStatus => {
    const mapping: Record<string, ArticleStatus> = {
      "Idea": "idea",
      "Drafting": "drafting",
      "In Review": "in_review",
      "Approved": "approved",
      "Scheduled": "scheduled",
      "Published": "published",
    };
    return mapping[value] || "drafting";
  };

  return records.map((record) => ({
    id: record.id,
    title: record.get("Title") as string,
    issueId: (record.get("Issue") as string[])?.[0],
    contentType: mapAirtableToContentType(record.get("Content Type") as string),
    primaryBrandId: (record.get("Primary Brand") as string[])?.[0],
    secondaryBrandIds: (record.get("Secondary Brand") as string[]) || [],
    pillar: mapAirtableToPillar(record.get("Pillar") as string),
    status: mapAirtableToStatus(record.get("Status") as string),
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
  const fields: Airtable.FieldSet = {
    "Title": article.title,
    "Content Type": contentTypeToAirtable[article.contentType],
    "Primary Brand": [article.primaryBrandId],
    "Pillar": pillarToAirtable[article.pillar],
    "Status": statusToAirtable[article.status],
    "Content": article.content,
  };

  // Only add optional fields if they have values
  if (article.issueId) fields["Issue"] = [article.issueId];
  if (article.secondaryBrandIds && article.secondaryBrandIds.length > 0) {
    // Field only allows one selection, so take the first one
    fields["Secondary Brand"] = [article.secondaryBrandIds[0]];
  }
  if (article.excerpt) fields["Excerpt"] = article.excerpt;
  if (article.metaDescription) fields["Meta Description"] = article.metaDescription;
  if (article.targetWordCount) fields["Target Word Count"] = article.targetWordCount;
  if (article.featuredImageUrl) fields["Featured Image URL"] = article.featuredImageUrl;
  if (article.featuredImagePrompt) fields["Featured Image Prompt"] = article.featuredImagePrompt;
  if (article.publishDate) fields["Publish Date"] = article.publishDate;

  const record = await base(TABLES.ARTICLES).create(fields);

  return record.id;
}

export async function updateArticle(
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const fields: Airtable.FieldSet = {};

  if (updates.title) fields["Title"] = updates.title;
  // Handle issue assignment - empty string means unassign
  if (updates.issueId !== undefined) {
    fields["Issue"] = updates.issueId ? [updates.issueId] : [];
  }
  if (updates.contentType) fields["Content Type"] = contentTypeToAirtable[updates.contentType];
  if (updates.primaryBrandId) fields["Primary Brand"] = [updates.primaryBrandId];
  if (updates.secondaryBrandIds && updates.secondaryBrandIds.length > 0) {
    fields["Secondary Brand"] = [updates.secondaryBrandIds[0]];
  }
  if (updates.pillar) fields["Pillar"] = pillarToAirtable[updates.pillar];
  if (updates.status) fields["Status"] = statusToAirtable[updates.status];
  if (updates.content) fields["Content"] = updates.content;
  if (updates.excerpt !== undefined) fields["Excerpt"] = updates.excerpt || "";
  if (updates.metaDescription !== undefined) fields["Meta Description"] = updates.metaDescription || "";
  if (updates.featuredImageUrl) fields["Featured Image URL"] = updates.featuredImageUrl;
  // Only include publish date if it has a value, otherwise Airtable will reject empty string
  if (updates.publishDate && updates.publishDate !== "") {
    fields["Publish Date"] = updates.publishDate;
  }

  await base(TABLES.ARTICLES).update(id, fields);
}

// ============ LINKEDIN POSTS ============

export async function getLinkedInPosts(filters?: {
  status?: LinkedInPostStatus;
  brandId?: string;
  articleId?: string;
  postType?: LinkedInPost["postType"];
}): Promise<LinkedInPost[]> {
  let filterFormula = "";
  const conditions: string[] = [];

  if (filters?.status) {
    conditions.push(`{Status} = "${linkedInStatusToAirtable[filters.status]}"`);
  }
  if (filters?.brandId) {
    conditions.push(`FIND("${filters.brandId}", ARRAYJOIN({Brand Account}))`);
  }
  if (filters?.articleId) {
    conditions.push(`FIND("${filters.articleId}", ARRAYJOIN({Source Article}))`);
  }
  if (filters?.postType) {
    conditions.push(`{Post Type} = "${linkedInPostTypeToAirtable[filters.postType]}"`);
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

  // Helper to map Airtable values back to internal values
  const mapAirtableToPostType = (value: string): LinkedInPost["postType"] => {
    const mapping: Record<string, LinkedInPost["postType"]> = {
      "Hot Take": "hot_take",
      "Article Share": "article_share",
      "Quote Graphic": "quote_graphic",
      "Poll": "poll",
      "Thread": "thread",
    };
    return mapping[value] || "article_share";
  };

  const mapAirtableToPostStatus = (value: string): LinkedInPostStatus => {
    const mapping: Record<string, LinkedInPostStatus> = {
      "Draft": "draft",
      "Approved": "approved",
      "Scheduled": "scheduled",
      "Posted": "posted",
    };
    return mapping[value] || "draft";
  };

  return records.map((record) => ({
    id: record.id,
    title: record.get("Post Title") as string,
    sourceArticleId: (record.get("Source Article") as string[])?.[0],
    postType: mapAirtableToPostType(record.get("Post Type") as string),
    brandId: (record.get("Brand Account") as string[])?.[0],
    content: record.get("Content") as string,
    characterCount: (record.get("Content") as string)?.length || 0,
    hashtags: record.get("Hashtags") as string | undefined,
    linkUrl: record.get("Link URL") as string | undefined,
    imageUrl: record.get("Image URL") as string | undefined,
    status: mapAirtableToPostStatus(record.get("Status") as string),
    scheduledDate: record.get("Scheduled Date") as string | undefined,
    scheduledTime: record.get("Scheduled Time") as string | undefined,
    postedDate: record.get("Posted Date") as string | undefined,
    postUrl: record.get("Post URL") as string | undefined,
  }));
}

export async function createLinkedInPost(
  post: Omit<LinkedInPost, "id" | "characterCount">
): Promise<string> {
  const fields: Airtable.FieldSet = {
    "Post Title": post.title,
    "Post Type": linkedInPostTypeToAirtable[post.postType],
    "Brand Account": [post.brandId],
    "Content": post.content,
    "Status": linkedInStatusToAirtable[post.status],
  };

  // Only add optional fields if they have values
  if (post.sourceArticleId) fields["Source Article"] = [post.sourceArticleId];
  if (post.hashtags) fields["Hashtags"] = post.hashtags;
  if (post.linkUrl) fields["Link URL"] = post.linkUrl;
  if (post.imageUrl) fields["Image URL"] = post.imageUrl;
  if (post.scheduledDate) fields["Scheduled Date"] = post.scheduledDate;
  if (post.scheduledTime) fields["Scheduled Time"] = post.scheduledTime;

  const record = await base(TABLES.LINKEDIN_POSTS).create(fields);

  return record.id;
}

export async function updateLinkedInPost(
  id: string,
  updates: Partial<Omit<LinkedInPost, "id" | "characterCount">>
): Promise<void> {
  const fields: Airtable.FieldSet = {};

  if (updates.title) fields["Post Title"] = updates.title;
  if (updates.content) fields["Content"] = updates.content;
  if (updates.status) fields["Status"] = linkedInStatusToAirtable[updates.status];
  // Only include dates if they have values, otherwise Airtable will reject empty strings
  if (updates.scheduledDate && updates.scheduledDate !== "") {
    fields["Scheduled Date"] = updates.scheduledDate;
  }
  if (updates.scheduledTime !== undefined) fields["Scheduled Time"] = updates.scheduledTime || "";
  if (updates.hashtags !== undefined) fields["Hashtags"] = updates.hashtags || "";

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

export async function createIssue(issue: Omit<Issue, "id">): Promise<string> {
  const fields: Airtable.FieldSet = {
    "Issue Number": issue.issueNumber,
    "Issue Title": issue.title,
    "Publish Date": issue.publishDate,
    "Status": issue.status,
  };

  if (issue.themeDescription) fields["Theme Description"] = issue.themeDescription;
  if (issue.notes) fields["Notes"] = issue.notes;

  const record = await base(TABLES.ISSUES).create(fields);
  return record.id;
}

export async function updateIssue(
  id: string,
  updates: Partial<Omit<Issue, "id">>
): Promise<void> {
  const fields: Airtable.FieldSet = {};

  if (updates.issueNumber) fields["Issue Number"] = updates.issueNumber;
  if (updates.title) fields["Issue Title"] = updates.title;
  if (updates.publishDate && updates.publishDate !== "") {
    fields["Publish Date"] = updates.publishDate;
  }
  if (updates.status) fields["Status"] = updates.status;
  if (updates.themeDescription !== undefined) fields["Theme Description"] = updates.themeDescription || "";
  if (updates.notes !== undefined) fields["Notes"] = updates.notes || "";

  await base(TABLES.ISSUES).update(id, fields);
}

// ============ TOPICS ============

// Helper to map Airtable values back to internal values
function mapAirtableToTopicSource(value: string): Topic["source"] {
  const mapping: Record<string, Topic["source"]> = {
    "AI Suggested": "ai_suggested",
    "Manual": "manual",
    "News": "news",
    "Reference Material": "reference_material",
  };
  return mapping[value] || "manual";
}

function mapAirtableToPillar(value: string): Topic["pillar"] | undefined {
  const mapping: Record<string, Topic["pillar"]> = {
    "Tech Leadership": "tech_leadership",
    "Delivery Excellence": "delivery_excellence",
    "Workforce Transformation": "workforce_transformation",
    "Emerging Talent": "emerging_talent",
    "Human Side": "human_side",
  };
  return mapping[value];
}

function mapAirtableToTopicPriority(value: string): Topic["priority"] {
  const mapping: Record<string, Topic["priority"]> = {
    "High": "high",
    "Medium": "medium",
    "Low": "low",
  };
  return mapping[value] || "medium";
}

function mapAirtableToTopicTimeliness(value: string): Topic["timeliness"] {
  const mapping: Record<string, Topic["timeliness"]> = {
    "Evergreen": "evergreen",
    "Timely (use soon)": "timely",
    "Dated (expires)": "dated",
  };
  return mapping[value] || "evergreen";
}

function mapAirtableToTopicStatus(value: string): Topic["status"] {
  const mapping: Record<string, Topic["status"]> = {
    "New": "new",
    "Approved": "approved",
    "Assigned": "assigned",
    "Used": "used",
    "Rejected": "rejected",
  };
  return mapping[value] || "new";
}

export async function getTopics(filters?: {
  status?: Topic["status"];
  priority?: Topic["priority"];
  brandId?: string;
  pillar?: Topic["pillar"];
}): Promise<Topic[]> {
  const conditions: string[] = [];

  if (filters?.status) {
    conditions.push(`{Status} = "${topicStatusToAirtable[filters.status]}"`);
  }
  if (filters?.priority) {
    conditions.push(`{Priority} = "${topicPriorityToAirtable[filters.priority]}"`);
  }
  if (filters?.brandId) {
    conditions.push(`FIND("${filters.brandId}", ARRAYJOIN({Primary Brand Fit}))`);
  }
  if (filters?.pillar) {
    conditions.push(`{Pillar} = "${pillarToAirtable[filters.pillar]}"`);
  }

  let filterFormula = "";
  if (conditions.length > 0) {
    filterFormula = conditions.length === 1 
      ? conditions[0] 
      : `AND(${conditions.join(", ")})`;
  }

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
    source: mapAirtableToTopicSource(record.get("Source") as string),
    sourceUrl: record.get("Source URL") as string | undefined,
    primaryBrandId: (record.get("Primary Brand Fit") as string[])?.[0],
    secondaryBrandIds: (record.get("Secondary Brand Fit") as string[]) || [],
    pillar: mapAirtableToPillar(record.get("Pillar") as string),
    priority: mapAirtableToTopicPriority(record.get("Priority") as string),
    timeliness: mapAirtableToTopicTimeliness(record.get("Timeliness") as string),
    status: mapAirtableToTopicStatus(record.get("Status") as string),
    assignedIssueId: (record.get("Assigned Issue") as string[])?.[0],
    notes: record.get("Notes") as string | undefined,
    createdAt: record.get("Created") as string,
  }));
}

export async function createTopic(
  topic: Omit<Topic, "id" | "createdAt">
): Promise<string> {
  const fields: Airtable.FieldSet = {
    "Topic": topic.topic,
    "Source": topicSourceToAirtable[topic.source],
    "Priority": topicPriorityToAirtable[topic.priority],
    "Timeliness": topicTimelinessToAirtable[topic.timeliness],
    "Status": topicStatusToAirtable[topic.status],
  };

  // Only add optional fields if they have values
  if (topic.description) fields["Description"] = topic.description;
  if (topic.sourceUrl) fields["Source URL"] = topic.sourceUrl;
  if (topic.primaryBrandId) fields["Primary Brand Fit"] = [topic.primaryBrandId];
  if (topic.secondaryBrandIds && topic.secondaryBrandIds.length > 0) {
    fields["Secondary Brand Fit"] = topic.secondaryBrandIds;
  }
  if (topic.pillar) fields["Pillar"] = pillarToAirtable[topic.pillar];
  if (topic.assignedIssueId) fields["Assigned Issue"] = [topic.assignedIssueId];
  if (topic.notes) fields["Notes"] = topic.notes;

  const record = await base(TABLES.TOPICS).create(fields);

  return record.id;
}

export async function updateTopic(
  id: string,
  updates: Partial<Omit<Topic, "id" | "createdAt">>
): Promise<void> {
  const fields: Airtable.FieldSet = {};

  if (updates.topic) fields["Topic"] = updates.topic;
  if (updates.description !== undefined) fields["Description"] = updates.description;
  if (updates.source) fields["Source"] = topicSourceToAirtable[updates.source];
  if (updates.sourceUrl !== undefined) fields["Source URL"] = updates.sourceUrl;
  if (updates.primaryBrandId) fields["Primary Brand Fit"] = [updates.primaryBrandId];
  if (updates.secondaryBrandIds) fields["Secondary Brand Fit"] = updates.secondaryBrandIds;
  if (updates.pillar) fields["Pillar"] = pillarToAirtable[updates.pillar];
  if (updates.priority) fields["Priority"] = topicPriorityToAirtable[updates.priority];
  if (updates.timeliness) fields["Timeliness"] = topicTimelinessToAirtable[updates.timeliness];
  if (updates.status) fields["Status"] = topicStatusToAirtable[updates.status];
  if (updates.assignedIssueId) fields["Assigned Issue"] = [updates.assignedIssueId];
  if (updates.notes !== undefined) fields["Notes"] = updates.notes;

  await base(TABLES.TOPICS).update(id, fields);
}

export async function deleteTopic(id: string): Promise<void> {
  await base(TABLES.TOPICS).destroy(id);
}
