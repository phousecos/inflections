"use client";

import { useState } from "react";
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

// Mock brands for UI - will be fetched from Airtable
const mockBrands: Brand[] = [
  { id: "1", name: "Unlimited Powerhouse", shortName: "UPH", primaryColor: "#0020C2" } as Brand,
  { id: "2", name: "Jerri Bland", shortName: "JB", primaryColor: "#FFA300" } as Brand,
  { id: "3", name: "AgentPMO", shortName: "APMO", primaryColor: "#10B981" } as Brand,
  { id: "4", name: "Vetters Group", shortName: "VG", primaryColor: "#6366F1" } as Brand,
  { id: "5", name: "Lumynr", shortName: "LUM", primaryColor: "#F22080" } as Brand,
  { id: "6", name: "Prept", shortName: "PRP", primaryColor: "#8B5CF6" } as Brand,
  { id: "7", name: "GenAIrate Project", shortName: "GAP", primaryColor: "#F59E0B" } as Brand,
  { id: "8", name: "ISSA", shortName: "ISSA", primaryColor: "#14B8A6" } as Brand,
];

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

  // LinkedIn posts state
  const [linkedInPosts, setLinkedInPosts] = useState<
    Array<{ type: string; content: string; selected: boolean }>
  >([]);

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStep("generating");

    // Simulate API call - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock generated content
    setGeneratedTitle("Why Your Disaster Recovery Plan Isn't Ready for 2026");
    setGeneratedContent(`## The Wake-Up Call We All Needed

The recent Amazon Web Services outage wasn't just an inconvenience—it was a preview of what happens when organizations treat disaster recovery as a checkbox exercise rather than a living, breathing part of their operations.

I've spent twenty years watching organizations scramble after incidents like this. The pattern is always the same: initial panic, followed by promises to "do better," followed by... nothing. Until the next outage.

## What Most DR Plans Get Wrong

Here's the uncomfortable truth: most disaster recovery plans are written once and forgotten. They sit in a SharePoint folder somewhere, gathering digital dust while the infrastructure they're meant to protect evolves beyond recognition.

The AWS outage exposed three critical gaps I see repeatedly:

**1. Testing Theater**
Annual DR tests that follow a script aren't tests—they're performances. Real disasters don't send calendar invites.

**2. Single Points of Failure**
Multi-cloud strategies sound great in vendor presentations. In practice, most organizations have deep dependencies they haven't mapped.

**3. Recovery Time Fantasies**
That four-hour RTO in your plan? When was the last time you actually tried to hit it under realistic conditions?

## What Actually Works

The organizations that weathered the AWS outage well shared common traits. They tested quarterly, not annually. They ran chaos engineering exercises that surprised their teams. They had clear, documented runbooks that didn't assume perfect conditions.

Most importantly, they treated disaster recovery as an ongoing practice, not a project with an end date.

## Your Next Steps

Before you close this article and move on to the next fire, ask yourself three questions:

1. When did we last test our DR plan without warning the team?
2. Can our newest team members execute the recovery procedures?
3. What single failure would hurt us most right now?

The answers might be uncomfortable. That's the point.`);
    setGeneratedExcerpt(
      "The recent AWS outage exposed critical gaps in how organizations approach disaster recovery. Here's what most DR plans get wrong—and what actually works."
    );
    setGeneratedMeta(
      "Learn why most disaster recovery plans fail and the three critical gaps the AWS outage exposed. Practical steps for IT leaders."
    );

    setIsGenerating(false);
    setCurrentStep("editing");
  };

  const handleGenerateLinkedIn = async () => {
    setCurrentStep("linkedin");

    // Mock LinkedIn posts
    setLinkedInPosts([
      {
        type: "hot_take",
        content: `The AWS outage wasn't a failure of technology.

It was a failure of imagination.

Most organizations I work with have disaster recovery "plans" that:
→ Were written 3+ years ago
→ Have never been tested under realistic conditions
→ Assume perfect communication during chaos

That's not a plan. That's a wish.

Here's what the organizations that recovered quickly had in common:

They tested quarterly, not annually.
They surprised their own teams.
They treated DR as practice, not paperwork.

When was the last time YOUR team ran a real DR test?

Not a scripted exercise. A real "what if everything breaks right now" test.

If you can't remember, that's your answer.

#DisasterRecovery #ITLeadership #BusinessContinuity`,
        selected: true,
      },
      {
        type: "article_share",
        content: `I've watched organizations scramble after outages for 20 years.

The pattern is always the same:
• Panic
• Promises to "do better"
• Nothing changes
• Repeat

The recent AWS outage was a masterclass in what happens when DR plans become checkbox exercises.

In my latest article, I break down:

✓ The 3 critical gaps most DR plans have
✓ Why "testing theater" is worse than no testing
✓ What resilient organizations do differently

Your four-hour RTO means nothing if you've never actually tried to hit it.

Link in comments 👇

#ITStrategy #RiskManagement #Leadership`,
        selected: true,
      },
      {
        type: "quote_graphic",
        content: `"Most disaster recovery plans are written once and forgotten. They sit in a SharePoint folder somewhere, gathering digital dust while the infrastructure they're meant to protect evolves beyond recognition."

Real disaster recovery isn't a document.

It's a practice.

#DisasterRecovery #ITLeadership`,
        selected: false,
      },
    ]);
  };

  const handleGenerateImage = () => {
    setCurrentStep("image");
  };

  const handlePush = () => {
    setCurrentStep("push");
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
              <div className="grid grid-cols-4 gap-2">
                {mockBrands.map((brand) => (
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
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: brand.primaryColor }}
                      />
                      <span className="text-sm font-medium truncate">
                        {brand.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
                disabled={!selectedBrand || !topic}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
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
              This usually takes 10-20 seconds
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
                    {generatedContent.split(/\s+/).length} words
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

            <div className="p-6 flex justify-between">
              <button
                onClick={() => setCurrentStep("setup")}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Setup
              </button>
              <button onClick={handleGenerateLinkedIn} className="btn-primary">
                Generate LinkedIn Posts
                <Linkedin className="w-4 h-4" />
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
                Generate or upload a featured image for this article
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
                Generate Image Options
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
              <button onClick={handlePush} className="btn-primary">
                Push to Airtable
                <Send className="w-4 h-4" />
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
                  setTopic("");
                  setAngle("");
                  setReferenceUrl("");
                  setGeneratedTitle("");
                  setGeneratedContent("");
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
