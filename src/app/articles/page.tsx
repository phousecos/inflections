"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  articleStatusConfig,
  contentTypeLabels,
  pillarLabels,
  formatDate,
} from "@/lib/utils";
import type { ArticleStatus, ContentType, ContentPillar } from "@/types";

// Mock articles data
const mockArticles = [
  {
    id: "1",
    title: "Why Your Disaster Recovery Plan Isn't Ready for 2026",
    contentType: "perspective" as ContentType,
    pillar: "tech_leadership" as ContentPillar,
    status: "approved" as ArticleStatus,
    brandName: "Unlimited Powerhouse",
    brandColor: "#0020C2",
    publishDate: "2026-01-06",
    wordCount: 892,
    createdAt: "2025-12-20",
  },
  {
    id: "2",
    title: "The Fractional CIO Model: When It Works and When It Doesn't",
    contentType: "feature" as ContentType,
    pillar: "tech_leadership" as ContentPillar,
    status: "drafting" as ArticleStatus,
    brandName: "Unlimited Powerhouse",
    brandColor: "#0020C2",
    publishDate: "2026-01-20",
    wordCount: 1456,
    createdAt: "2025-12-18",
  },
  {
    id: "3",
    title: "FCRA Updates: What Changed in 2025",
    contentType: "practitioner_guide" as ContentType,
    pillar: "workforce_transformation" as ContentPillar,
    status: "in_review" as ArticleStatus,
    brandName: "Vetters Group",
    brandColor: "#6366F1",
    publishDate: "2026-01-06",
    wordCount: 1124,
    createdAt: "2025-12-15",
  },
  {
    id: "4",
    title: "Returning to Tech in 2026: A Roadmap",
    contentType: "practitioner_guide" as ContentType,
    pillar: "workforce_transformation" as ContentPillar,
    status: "drafting" as ArticleStatus,
    brandName: "Lumynr",
    brandColor: "#F22080",
    publishDate: "2026-01-06",
    wordCount: 980,
    createdAt: "2025-12-14",
  },
  {
    id: "5",
    title: "Why Your PMO's First Priority Should Be Visibility",
    contentType: "perspective" as ContentType,
    pillar: "delivery_excellence" as ContentPillar,
    status: "approved" as ArticleStatus,
    brandName: "AgentPMO",
    brandColor: "#10B981",
    publishDate: "2026-01-08",
    wordCount: 756,
    createdAt: "2025-12-12",
  },
  {
    id: "6",
    title: "AI News: What Actually Matters This Month",
    contentType: "the_crossroads" as ContentType,
    pillar: "emerging_talent" as ContentPillar,
    status: "published" as ArticleStatus,
    brandName: "ISSA",
    brandColor: "#14B8A6",
    publishDate: "2025-12-20",
    wordCount: 520,
    createdAt: "2025-12-10",
  },
];

type ViewMode = "list" | "kanban";
type FilterStatus = ArticleStatus | "all";

export default function ArticlesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch = article.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = mockArticles.reduce(
    (acc, article) => {
      acc[article.status] = (acc[article.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-semibold text-studio-text-primary">
            Articles
          </h1>
          <p className="text-studio-text-secondary mt-1">
            Manage your magazine articles
          </p>
        </div>
        <Link href="/generate" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="card mb-6">
        <div className="p-4 flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-text-muted" />
            <input
              type="text"
              placeholder="Search articles..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-studio-text-muted" />
            <select
              className="select w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            >
              <option value="all">All Status</option>
              {Object.entries(articleStatusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label} ({statusCounts[key] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-studio-bg rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-white shadow-sm text-studio-text-primary"
                  : "text-studio-text-muted hover:text-studio-text-secondary"
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                viewMode === "kanban"
                  ? "bg-white shadow-sm text-studio-text-primary"
                  : "text-studio-text-muted hover:text-studio-text-secondary"
              )}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-studio-border bg-studio-bg">
                <th className="text-left text-xs font-medium text-studio-text-secondary uppercase tracking-wider px-6 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-medium text-studio-text-secondary uppercase tracking-wider px-6 py-3">
                  Brand
                </th>
                <th className="text-left text-xs font-medium text-studio-text-secondary uppercase tracking-wider px-6 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-studio-text-secondary uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-studio-text-secondary uppercase tracking-wider px-6 py-3">
                  Publish Date
                </th>
                <th className="text-right text-xs font-medium text-studio-text-secondary uppercase tracking-wider px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {filteredArticles.map((article) => {
                const statusConfig = articleStatusConfig[article.status];
                return (
                  <tr
                    key={article.id}
                    className="hover:bg-studio-bg/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-studio-text-muted mt-0.5" />
                        <div>
                          <p className="font-medium text-studio-text-primary">
                            {article.title}
                          </p>
                          <p className="text-xs text-studio-text-muted mt-0.5">
                            {article.wordCount} words ·{" "}
                            {pillarLabels[article.pillar]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: article.brandColor }}
                        />
                        <span className="text-sm text-studio-text-secondary">
                          {article.brandName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-studio-text-secondary">
                        {contentTypeLabels[article.contentType]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "badge",
                          statusConfig.bgColor,
                          statusConfig.color
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-studio-text-secondary">
                        <Calendar className="w-4 h-4" />
                        {formatDate(article.publishDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="btn-ghost p-2">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="btn-ghost p-2">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="btn-ghost p-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredArticles.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-studio-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-studio-text-primary mb-1">
                No articles found
              </h3>
              <p className="text-studio-text-secondary">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-4 gap-4">
          {(["drafting", "in_review", "approved", "published"] as ArticleStatus[]).map(
            (status) => {
              const config = articleStatusConfig[status];
              const statusArticles = filteredArticles.filter(
                (a) => a.status === status
              );

              return (
                <div key={status} className="card">
                  <div
                    className={cn(
                      "px-4 py-3 border-b border-studio-border flex items-center justify-between",
                      config.bgColor
                    )}
                  >
                    <span className={cn("font-medium text-sm", config.color)}>
                      {config.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        config.bgColor,
                        config.color
                      )}
                    >
                      {statusArticles.length}
                    </span>
                  </div>
                  <div className="p-3 space-y-3 min-h-[400px]">
                    {statusArticles.map((article) => (
                      <div
                        key={article.id}
                        className="p-3 bg-studio-bg rounded-lg hover:shadow-soft transition-shadow cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: article.brandColor }}
                          />
                          <span className="text-xs text-studio-text-muted">
                            {article.brandName}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-studio-text-primary line-clamp-2">
                          {article.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-studio-text-muted">
                            {article.wordCount} words
                          </span>
                          <span className="text-xs text-studio-text-muted">
                            {formatDate(article.publishDate)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
