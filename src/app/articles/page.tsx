"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  articleStatusConfig,
  contentTypeLabels,
  pillarLabels,
  formatDate,
} from "@/lib/utils";
import type { Article, Brand, ArticleStatus, ContentType, ContentPillar } from "@/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | "all">("all");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterPillar, setFilterPillar] = useState<ContentPillar | "all">("all");
  const [filterContentType, setFilterContentType] = useState<ContentType | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Edit modal state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    excerpt: "",
    metaDescription: "",
    status: "drafting" as ArticleStatus,
    publishDate: "",
    issueId: "",
  });

  // Fetch articles, brands, and issues
  useEffect(() => {
    async function fetchData() {
      try {
        const [articlesRes, brandsRes, issuesRes] = await Promise.all([
          fetch("/api/airtable/articles"),
          fetch("/api/airtable/brands"),
          fetch("/api/airtable/issues"),
        ]);

        if (!articlesRes.ok) throw new Error("Failed to fetch articles");
        if (!brandsRes.ok) throw new Error("Failed to fetch brands");
        if (!issuesRes.ok) throw new Error("Failed to fetch issues");

        const [articlesData, brandsData, issuesData] = await Promise.all([
          articlesRes.json(),
          brandsRes.json(),
          issuesRes.json(),
        ]);

        setArticles(articlesData);
        setBrands(brandsData);
        setIssues(issuesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== "all" && article.status !== filterStatus) return false;
    if (filterBrand !== "all" && article.primaryBrandId !== filterBrand) return false;
    if (filterPillar !== "all" && article.pillar !== filterPillar) return false;
    if (filterContentType !== "all" && article.contentType !== filterContentType) return false;
    return true;
  });

  const getBrandName = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.name || "Unknown";
  };

  const getBrandColor = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.primaryColor || "#666";
  };

  const getWordCount = (content: string) => {
    if (!content) return 0;
    return content
      .replace(/<[^>]*>/g, "") // Strip HTML
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const openEditModal = (article: Article) => {
    setEditForm({
      title: article.title,
      excerpt: article.excerpt || "",
      metaDescription: article.metaDescription || "",
      status: article.status,
      publishDate: article.publishDate || "",
      issueId: article.issueId || "",
    });
    setEditingArticle(article);
  };

  const handleSaveEdit = async () => {
    if (!editingArticle) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/airtable/articles/${editingArticle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to update article");
      }

      // Update local state
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingArticle.id ? { ...a, ...editForm } : a
        )
      );

      setEditingArticle(null);
    } catch (err) {
      console.error("Save error:", err);
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-semibold text-studio-text-primary">
            Articles
          </h1>
          <p className="text-studio-text-secondary mt-1">
            {filteredArticles.length} articles
          </p>
        </div>
        <Link href="/generate" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-studio-text-muted" />
            <input
              type="text"
              placeholder="Search articles..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "btn-secondary",
              showFilters && "bg-studio-bg"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-studio-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label">Status</label>
                <select
                  className="select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ArticleStatus | "all")}
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(articleStatusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Brand</label>
                <select
                  className="select"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value="all">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Pillar</label>
                <select
                  className="select"
                  value={filterPillar}
                  onChange={(e) => setFilterPillar(e.target.value as ContentPillar | "all")}
                >
                  <option value="all">All Pillars</option>
                  {Object.entries(pillarLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Content Type</label>
                <select
                  className="select"
                  value={filterContentType}
                  onChange={(e) => setFilterContentType(e.target.value as ContentType | "all")}
                >
                  <option value="all">All Types</option>
                  {Object.entries(contentTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Articles Table */}
      {filteredArticles.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-studio-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-studio-text-primary mb-2">
            No articles found
          </h3>
          <p className="text-studio-text-secondary mb-6">
            {searchQuery || filterStatus !== "all" || filterBrand !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating your first article"}
          </p>
          {!searchQuery && filterStatus === "all" && filterBrand === "all" && (
            <Link href="/generate" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              Create Article
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-studio-bg border-b border-studio-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-studio-text-secondary">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-studio-text-secondary">
                  Brand
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-studio-text-secondary">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-studio-text-secondary">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-studio-text-secondary">
                  Words
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-studio-text-secondary">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-studio-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-studio-bg/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {article.featuredImageUrl ? (
                        <img
                          src={article.featuredImageUrl}
                          alt=""
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-studio-bg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-studio-text-muted" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-studio-text-primary mb-1">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-xs text-studio-text-muted line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getBrandColor(article.primaryBrandId) }}
                      />
                      <span className="text-sm text-studio-text-secondary">
                        {getBrandName(article.primaryBrandId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="badge bg-studio-bg text-studio-text-secondary text-xs">
                        {contentTypeLabels[article.contentType]}
                      </span>
                      <span className="text-xs text-studio-text-muted">
                        {pillarLabels[article.pillar]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "badge text-xs",
                        articleStatusConfig[article.status].bgColor,
                        articleStatusConfig[article.status].color
                      )}
                    >
                      {articleStatusConfig[article.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-studio-text-secondary">
                      {article.actualWordCount || getWordCount(article.content)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {article.publishDate && (
                        <div className="flex items-center gap-1 text-xs text-studio-text-secondary">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.publishDate)}
                        </div>
                      )}
                      <span className="text-xs text-studio-text-muted">
                        Updated {formatDate(article.updatedAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {article.publishedUrl && (
                        <a
                          href={article.publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-studio-bg rounded-lg transition-colors"
                          title="View published"
                        >
                          <ExternalLink className="w-4 h-4 text-studio-text-muted" />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(article)}
                        className="p-2 hover:bg-studio-bg rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-studio-text-muted" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-studio-border flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-display font-semibold">Edit Article</h2>
              <button
                onClick={() => setEditingArticle(null)}
                className="p-2 hover:bg-studio-bg rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Excerpt</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={editForm.excerpt}
                  onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Meta Description</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={editForm.metaDescription}
                  onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ArticleStatus })}
                  >
                    {Object.entries(articleStatusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Publish Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editForm.publishDate}
                    onChange={(e) => setEditForm({ ...editForm, publishDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Assign to Issue (optional)</label>
                <select
                  className="select"
                  value={editForm.issueId}
                  onChange={(e) => setEditForm({ ...editForm, issueId: e.target.value })}
                >
                  <option value="">No issue assigned</option>
                  {issues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      Issue #{issue.issueNumber} - {issue.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-studio-border flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setEditingArticle(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
