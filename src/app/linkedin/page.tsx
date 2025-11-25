"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Linkedin,
  Calendar,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  linkedInPostTypeLabels,
  formatDate,
} from "@/lib/utils";
import type { LinkedInPost, Brand, LinkedInPostStatus, LinkedInPostType } from "@/types";

const statusColors: Record<LinkedInPostStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700" },
  approved: { bg: "bg-green-50", text: "text-green-700" },
  scheduled: { bg: "bg-purple-50", text: "text-purple-700" },
  posted: { bg: "bg-blue-50", text: "text-blue-700" },
};

const statusLabels: Record<LinkedInPostStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  scheduled: "Scheduled",
  posted: "Posted",
};

export default function LinkedInPage() {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LinkedInPostStatus | "all">("all");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterPostType, setFilterPostType] = useState<LinkedInPostType | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Edit modal state
  const [editingPost, setEditingPost] = useState<LinkedInPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    hashtags: "",
    status: "draft" as LinkedInPostStatus,
    scheduledDate: "",
    scheduledTime: "",
  });

  // Fetch posts and brands
  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, brandsRes] = await Promise.all([
          fetch("/api/airtable/linkedin"),
          fetch("/api/airtable/brands"),
        ]);

        if (!postsRes.ok) throw new Error("Failed to fetch LinkedIn posts");
        if (!brandsRes.ok) throw new Error("Failed to fetch brands");

        const [postsData, brandsData] = await Promise.all([
          postsRes.json(),
          brandsRes.json(),
        ]);

        setPosts(postsData);
        setBrands(brandsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !post.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== "all" && post.status !== filterStatus) return false;
    if (filterBrand !== "all" && post.brandId !== filterBrand) return false;
    if (filterPostType !== "all" && post.postType !== filterPostType) return false;
    return true;
  });

  const getBrandName = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.name || "Unknown";
  };

  const getBrandColor = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.primaryColor || "#666";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy");
    }
  };

  const openEditModal = (post: LinkedInPost) => {
    setEditForm({
      title: post.title,
      content: post.content,
      hashtags: post.hashtags || "",
      status: post.status,
      scheduledDate: post.scheduledDate || "",
      scheduledTime: post.scheduledTime || "",
    });
    setEditingPost(post);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/airtable/linkedin/${editingPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Failed to update post");

      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id ? { ...p, ...editForm, characterCount: editForm.content.length } : p
        )
      );

      setEditingPost(null);
    } catch (err) {
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
            LinkedIn Posts
          </h1>
          <p className="text-studio-text-secondary mt-1">
            {filteredPosts.length} posts
          </p>
        </div>
        <Link href="/generate" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-studio-text-muted" />
            <input
              type="text"
              placeholder="Search posts..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Status</label>
                <select
                  className="select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as LinkedInPostStatus | "all")}
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
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
                <label className="label">Post Type</label>
                <select
                  className="select"
                  value={filterPostType}
                  onChange={(e) => setFilterPostType(e.target.value as LinkedInPostType | "all")}
                >
                  <option value="all">All Types</option>
                  {Object.entries(linkedInPostTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="card p-12 text-center">
          <Linkedin className="w-12 h-12 text-studio-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-studio-text-primary mb-2">
            No LinkedIn posts found
          </h3>
          <p className="text-studio-text-secondary mb-6">
            {searchQuery || filterStatus !== "all" || filterBrand !== "all"
              ? "Try adjusting your filters"
              : "Get started by generating content"}
          </p>
          {!searchQuery && filterStatus === "all" && filterBrand === "all" && (
            <Link href="/generate" className="btn-primary inline-flex">
              <Plus className="w-4 h-4" />
              Generate Content
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getBrandColor(post.brandId) }}
                    />
                    <span className="text-sm font-medium text-studio-text-secondary">
                      {getBrandName(post.brandId)}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-studio-text-primary mb-1">
                    {post.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-studio-bg text-studio-text-secondary text-xs">
                      {linkedInPostTypeLabels[post.postType]}
                    </span>
                    <span
                      className={cn(
                        "badge text-xs",
                        statusColors[post.status].bg,
                        statusColors[post.status].text
                      )}
                    >
                      {statusLabels[post.status]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-studio-bg rounded-lg p-4 mb-4">
                <p className="text-sm text-studio-text-primary whitespace-pre-wrap line-clamp-4">
                  {post.content}
                </p>
                {post.hashtags && (
                  <p className="text-sm text-brand-blue mt-2">
                    {post.hashtags}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-studio-border">
                  <span className="text-xs text-studio-text-muted">
                    {post.characterCount} characters
                  </span>
                  <button
                    onClick={() => copyToClipboard(`${post.content}\n\n${post.hashtags || ""}`)}
                    className="text-xs text-brand-blue hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-sm">
                {post.scheduledDate && (
                  <div className="flex items-center gap-2 text-studio-text-secondary">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Scheduled: {formatDate(post.scheduledDate)}
                      {post.scheduledTime && ` at ${post.scheduledTime}`}
                    </span>
                  </div>
                )}
                {post.postedDate && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Posted: {formatDate(post.postedDate)}</span>
                  </div>
                )}
                {post.linkUrl && (
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-blue hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Article Link
                  </a>
                )}
                {post.postUrl && (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-brand-blue hover:underline"
                  >
                    <Linkedin className="w-4 h-4" />
                    View on LinkedIn
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-studio-border">
                <button 
                  onClick={() => openEditModal(post)}
                  className="flex-1 btn-secondary text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-studio-border flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-display font-semibold">Edit LinkedIn Post</h2>
              <button
                onClick={() => setEditingPost(null)}
                className="p-2 hover:bg-studio-bg rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Title (Internal Reference)</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Content</label>
                <textarea
                  className="textarea"
                  rows={8}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                />
                <p className="text-xs text-studio-text-muted mt-1">
                  {editForm.content.length} characters
                </p>
              </div>

              <div>
                <label className="label">Hashtags</label>
                <input
                  type="text"
                  className="input"
                  placeholder="#hashtag1 #hashtag2"
                  value={editForm.hashtags}
                  onChange={(e) => setEditForm({ ...editForm, hashtags: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LinkedInPostStatus })}
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Scheduled Date</label>
                  <input
                    type="date"
                    className="input"
                    value={editForm.scheduledDate}
                    onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Scheduled Time (optional)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 9:00 AM"
                  value={editForm.scheduledTime}
                  onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-studio-border flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setEditingPost(null)}
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
