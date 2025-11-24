"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronRight,
  Loader2,
  Check,
  RefreshCw,
  Linkedin,
  Image,
  Send,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ContentType, ContentPillar, Brand } from "@/types";
import { contentTypeLabels, pillarLabels, wordCountTargets } from "@/lib/utils";

type Step = "setup" | "generating" | "editing" | "linkedin" | "image" | "push";

const steps: { key: Step; label: string }[] = [
  { key: "setup", label: "Setup" },
  { key: "generating", label: "Generate" },
  { key: "editing", label: "Edit" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "image", label: "Image" },
  { key: "push", label: "Publish" },
];

export default function GenerateArticle() {
  const [currentStep, setCurrentStep] = useState<Step>("setup");
  const [isGenerating, setIsGenerating] = useState(false);

  // Brands from Airtable
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [brandsError, setBrandsError] = useState<string | null>(null);

  // Form state
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [contentType, setContentType] = useState<ContentType>("perspective");
  const [pillar, setPillar] = useState<ContentPillar>("tech_leadership");
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");

  // Generated content state
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedExcerpt, setGeneratedExcerpt] = useState("");
  const [generatedMeta, setGeneratedMeta] = useState("");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  // LinkedIn posts state
  const [linkedInPosts, setLinkedInPosts] = useState<
    Array<{ type: string; content: string; hashtags: string[]; selected: boolean }>
  >([]);

  // Fetch brands on mount
  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/airtable/brands");
        if (!response.ok) {
          throw new Error("Failed to fetch brands");
        }
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        setBrandsError(error instanceof Error ? error.message : "Failed to load brands");
      } finally {
        setBrandsLoading(false);
      }
    }
    fetchBrands();
  }, []);

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);
  const selectedBrandData = brands.find((b) => b.id === selectedBrand);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStep("generating");

    try {
      const response = await fetch("/api/generate/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrand,
          pillar,
          contentType,
          topic,
          angle: angle || undefined,
          referenceUrl: referenceUrl || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate article");
      }

      const data = await response.json();
      
      setGeneratedTitle(data.title);
      setGeneratedContent(data.content);
      setGeneratedExcerpt(data.excerpt);
      setGeneratedMeta(data.metaDescription);
      setGeneratedTags(data.suggestedTags || []);
      
      setCurrentStep("editing");
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate article. Please try again.");
      setCurrentStep("setup");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateLinkedIn = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: selectedBrand,
          articleTitle: generatedTitle,
          articleContent: generatedContent,
          postTypes: ["hot_take", "article_share", "quote_graphic"],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate LinkedIn posts");
      }

      const data = await response.json();
      
      setLinkedInPosts(
        data.posts.map((post: { type: string; content: string; hashtags: string[] }) => ({
          ...post,
          selected: true,
        }))
      );
      
      setCurrentStep("linkedin");
    } catch (error) {
      console.error("LinkedIn generation error:", error);
      alert("Failed to generate LinkedIn posts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = () => {
    setCurrentStep("image");
  };

  const handlePush = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/airtable/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article: {
            title: generatedTitle,
            contentType,
            primaryBrandId: selectedBrand,
            secondaryBrandIds: [],
            pillar,
            status: "drafting",
            content: generatedContent,
            excerpt: generatedExcerpt,
            metaDescription: generatedMeta,
            targetWordCount: wordCountTargets[contentType].max,
          },
          linkedInPosts: linkedInPosts
            .filter((p) => p.selected)
            .map((p) => ({
              title: `${p.type} - ${generatedTitle.slice(0, 30)}...`,
              postType: p.type,
              brandId: selectedBrand,
              content: p.content,
              hashtags: p.hashtags.join(" "),
              status: "draft",
            })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to push to Airtable");
      }

      setCurrentStep("push");
    } catch (error) {
      console.error("Push error:", error);
      alert("Failed to push to Airtable. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-studio-text-secondary hover:text-studio-text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-display font-semibold text-studio-text-primary">
          Generate Article
        </h1>
        <p className="text-studio-text-secondary mt-1">
          Create a new article with AI assistance
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  index < currentStepIndex &&
                    "bg-green-50 text-green-600",
                  index === currentStepIndex &&
                    "bg-brand-blue text-white",
                  index > currentStepIndex &&
                    "bg-studio-bg text-studio-text-muted"
                )}
              >
                {index < currentStepIndex ? (
                  <Check className="w-4 h-4" />
                ) : index === currentStepIndex && isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                )}
                {step.label}
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-studio-text-muted mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {/* Setup Step */}
        {currentStep === "setup" && (
          <div className="p-6 space-y-6">
            <div>
              <label className="label">Brand</label>
              {brandsLoading ? (
                <div className="flex items-center gap-2 text-studio-text-muted py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading brands...
                </div>
              ) : brandsError ? (
                <div className="text-red-500 py-4">{brandsError}</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all",
                        selectedBrand === brand.id
                          ? "border-brand-blue bg-studio-accent-blueSoft"
                          : "border-studio-border hover:border-brand-blue/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: brand.primaryColor || "#666" }}
                        />
                        <span className="text-sm font-medium truncate">
                          {brand.name}
                        </span>
                      </div>
                      {brand.shortName && (
                        <span className="text-xs text-studio-text-muted ml-5">
                          {brand.shortName}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedBrandData && (
              <div className="p-4 bg-studio-bg rounded-lg">
                <p className="text-sm text-studio-text-secondary">
                  <span className="font-medium text-studio-text-primary">Voice: </span>
                  {selectedBrandData.voiceSummary || "No voice summary defined"}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Content Type</label>
                <select
                  className="select"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                >
                  {Object.entries(contentTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label} ({wordCountTargets[key as ContentType].min}-
                      {wordCountTargets[key as ContentType].max} words)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Pillar</label>
                <select
                  className="select"
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value as ContentPillar)}
                >
                  {Object.entries(pillarLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Topic / Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Why disaster recovery plans fail during real outages"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                Angle / Hook{" "}
                <span className="text-studio-text-muted font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Tie to the recent AWS outage news"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
              />
            </div>

            <div>
              <label className="label">
                Reference URL{" "}
                <span className="text-studio-text-muted font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="url"
                className="input"
                placeholder="https://..."
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-studio-border flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={!selectedBrand || !topic || isGenerating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate Draft
              </button>
            </div>
          </div>
        )}

        {/* Generating Step */}
        {currentStep === "generating" && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-studio-accent-blueSoft flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
            <h2 className="text-xl font-display font-semibold text-studio-text-primary mb-2">
              Generating your article...
            </h2>
            <p className="text-studio-text-secondary">
              This usually takes 15-30 seconds
            </p>
          </div>
        )}

        {/* Editing Step */}
        {currentStep === "editing" && (
          <div className="divide-y divide-studio-border">
            <div className="p-6">
              <label className="label">Title</label>
              <input
                type="text"
                className="input text-lg font-display font-semibold"
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0">Content</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-studio-text-muted">
                    {generatedContent.split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button className="btn-ghost text-xs py-1 px-2">
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>
              <textarea
                className="textarea font-mono text-sm"
                rows={20}
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
              />
            </div>

            <div className="p-6">
              <label className="label">Excerpt (2-3 sentences)</label>
              <textarea
                className="textarea"
                rows={3}
                value={generatedExcerpt}
                onChange={(e) => setGeneratedExcerpt(e.target.value)}
              />
            </div>

            <div className="p-6">
              <label className="label">Meta Description (155 chars max)</label>
              <input
                type="text"
                className="input"
                maxLength={155}
                value={generatedMeta}
                onChange={(e) => setGeneratedMeta(e.target.value)}
              />
              <p className="text-xs text-studio-text-muted mt-1">
                {generatedMeta.length}/155 characters
              </p>
            </div>

            {generatedTags.length > 0 && (
              <div className="p-6">
                <label className="label">Suggested Tags</label>
                <div className="flex flex-wrap gap-2">
                  {generatedTags.map((tag, i) => (
                    <span key={i} className="badge bg-studio-bg text-studio-text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 flex justify-between">
              <button
                onClick={() => setCurrentStep("setup")}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Setup
              </button>
              <button 
                onClick={handleGenerateLinkedIn} 
                className="btn-primary"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Generate LinkedIn Posts
                    <Linkedin className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* LinkedIn Step */}
        {currentStep === "linkedin" && (
          <div className="divide-y divide-studio-border">
            <div className="p-6">
              <h2 className="text-lg font-display font-semibold text-studio-text-primary mb-1">
                LinkedIn Posts
              </h2>
              <p className="text-sm text-studio-text-secondary">
                Select which posts to include when pushing to Airtable
              </p>
            </div>

            {linkedInPosts.map((post, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={post.selected}
                    onChange={() => {
                      const updated = [...linkedInPosts];
                      updated[index].selected = !updated[index].selected;
                      setLinkedInPosts(updated);
                    }}
                    className="mt-1 w-5 h-5 rounded border-studio-border text-brand-blue focus:ring-brand-blue"
                  />
                  <div className="flex-1">
                    <span className="badge bg-studio-bg text-studio-text-secondary mb-2">
                      {post.type.replace("_", " ")}
                    </span>
                    <textarea
                      className="textarea font-mono text-sm"
                      rows={8}
                      value={post.content}
                      onChange={(e) => {
                        const updated = [...linkedInPosts];
                        updated[index].content = e.target.value;
                        setLinkedInPosts(updated);
                      }}
                    />
                    <p className="text-xs text-studio-text-muted mt-1">
                      {post.content.length} characters
                      {post.content.length > 1300 && (
                        <span className="text-amber-500 ml-2">
                          (over 1300 char limit)
                        </span>
                      )}
                    </p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <p className="text-xs text-studio-text-muted mt-1">
                        Hashtags: {post.hashtags.join(" ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="p-6 flex justify-between">
              <button
                onClick={() => setCurrentStep("editing")}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editing
              </button>
              <button onClick={handleGenerateImage} className="btn-primary">
                Generate Image
                <Image className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Image Step */}
        {currentStep === "image" && (
          <div className="divide-y divide-studio-border">
            <div className="p-6">
              <h2 className="text-lg font-display font-semibold text-studio-text-primary mb-1">
                Featured Image
              </h2>
              <p className="text-sm text-studio-text-secondary">
                Generate or upload a featured image for this article (optional)
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-studio-bg border-2 border-dashed border-studio-border flex items-center justify-center cursor-pointer hover:border-brand-blue/50 transition-colors"
                  >
                    <div className="text-center">
                      <Image className="w-8 h-8 text-studio-text-muted mx-auto mb-2" />
                      <span className="text-sm text-studio-text-muted">
                        Option {i}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn-secondary w-full">
                <Sparkles className="w-4 h-4" />
                Generate Image Options (Coming Soon)
              </button>
            </div>

            <div className="p-6 flex justify-between">
              <button
                onClick={() => setCurrentStep("linkedin")}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to LinkedIn
              </button>
              <button 
                onClick={handlePush} 
                className="btn-primary"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Push to Airtable
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Push Step */}
        {currentStep === "push" && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-display font-semibold text-studio-text-primary mb-2">
              Content Pushed to Airtable!
            </h2>
            <p className="text-studio-text-secondary mb-6">
              Your article and LinkedIn posts have been created in Airtable
            </p>

            <div className="card max-w-md mx-auto p-4 text-left mb-6">
              <h3 className="font-medium text-studio-text-primary mb-3">
                Created:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-studio-text-secondary">
                  <Check className="w-4 h-4 text-green-500" />1 Article (Draft)
                </li>
                <li className="flex items-center gap-2 text-studio-text-secondary">
                  <Check className="w-4 h-4 text-green-500" />
                  {linkedInPosts.filter((p) => p.selected).length} LinkedIn
                  Posts (Draft)
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link href="/articles" className="btn-secondary">
                View Articles
              </Link>
              <button
                onClick={() => {
                  setCurrentStep("setup");
                  setSelectedBrand("");
                  setTopic("");
                  setAngle("");
                  setReferenceUrl("");
                  setGeneratedTitle("");
                  setGeneratedContent("");
                  setGeneratedExcerpt("");
                  setGeneratedMeta("");
                  setGeneratedTags([]);
                  setLinkedInPosts([]);
                }}
                className="btn-primary"
              >
                <Sparkles className="w-4 h-4" />
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
