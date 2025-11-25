"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Edit,
  Loader2,
  X,
  Save,
  BookOpen,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Issue, Article } from "@/types";

type IssueStatus = Issue["status"];

const statusColors: Record<IssueStatus, { bg: string; text: string }> = {
  planning: { bg: "bg-gray-100", text: "text-gray-700" },
  in_production: { bg: "bg-blue-50", text: "text-blue-700" },
  ready: { bg: "bg-green-50", text: "text-green-700" },
  published: { bg: "bg-purple-50", text: "text-purple-700" },
};

const statusLabels: Record<IssueStatus, string> = {
  planning: "Planning",
  in_production: "In Production",
  ready: "Ready",
  published: "Published",
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    issueNumber: 1,
    title: "",
    publishDate: "",
    status: "planning" as IssueStatus,
    themeDescription: "",
    notes: "",
  });

  // Fetch issues and articles
  useEffect(() => {
    async function fetchData() {
      try {
        const [issuesRes, articlesRes] = await Promise.all([
          fetch("/api/airtable/issues"),
          fetch("/api/airtable/articles"),
        ]);

        if (!issuesRes.ok) throw new Error("Failed to fetch issues");
        if (!articlesRes.ok) throw new Error("Failed to fetch articles");

        const [issuesData, articlesData] = await Promise.all([
          issuesRes.json(),
          articlesRes.json(),
        ]);

        setIssues(issuesData);
        setArticles(articlesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openCreateModal = () => {
    const nextIssueNumber = issues.length > 0 
      ? Math.max(...issues.map(i => i.issueNumber)) + 1 
      : 1;
    
    setFormData({
      issueNumber: nextIssueNumber,
      title: "",
      publishDate: "",
      status: "planning",
      themeDescription: "",
      notes: "",
    });
    setEditingIssue(null);
    setShowModal(true);
  };

  const openEditModal = (issue: Issue) => {
    setFormData({
      issueNumber: issue.issueNumber,
      title: issue.title,
      publishDate: issue.publishDate,
      status: issue.status,
      themeDescription: issue.themeDescription || "",
      notes: issue.notes || "",
    });
    setEditingIssue(issue);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.title.trim()) {
      alert("Issue title is required");
      return;
    }

    setSaving(true);
    try {
      if (editingIssue) {
        // Update existing
        const response = await fetch("/api/airtable/issues", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingIssue.id, ...formData }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to update issue");
        }

        setIssues((prev) =>
          prev.map((i) => (i.id === editingIssue.id ? { ...i, ...formData } : i))
        );
      } else {
        // Create new
        const response = await fetch("/api/airtable/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "Failed to create issue");
        }

        const { id } = await response.json();
        setIssues((prev) => [{ id, ...formData }, ...prev]);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getArticlesForIssue = (issueId: string) => {
    return articles.filter((a) => a.issueId === issueId);
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
            Magazine Issues
          </h1>
          <p className="text-studio-text-secondary mt-1">
            {issues.length} issues • {issues.filter(i => i.status === 'in_production').length} in production
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Issue
        </button>
      </div>

      {/* Issues Grid */}
      {issues.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-studio-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-studio-text-primary mb-2">
            No issues yet
          </h3>
          <p className="text-studio-text-secondary mb-6">
            Create your first magazine issue to start organizing content
          </p>
          <button onClick={openCreateModal} className="btn-primary inline-flex">
            <Plus className="w-4 h-4" />
            Create First Issue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {issues.map((issue) => {
            const issueArticles = getArticlesForIssue(issue.id);
            const completedArticles = issueArticles.filter(
              (a) => a.status === "approved" || a.status === "published"
            );

            return (
              <div
                key={issue.id}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-studio-text-muted">
                        Issue #{issue.issueNumber}
                      </span>
                      <span
                        className={cn(
                          "badge text-xs",
                          statusColors[issue.status]?.bg || "bg-gray-100",
                          statusColors[issue.status]?.text || "text-gray-700"
                        )}
                      >
                        {statusLabels[issue.status] || issue.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-studio-text-primary mb-1">
                      {issue.title}
                    </h3>
                    {issue.publishDate && (
                      <div className="flex items-center gap-1 text-sm text-studio-text-secondary">
                        <Calendar className="w-4 h-4" />
                        {formatDate(issue.publishDate)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openEditModal(issue)}
                    className="p-2 hover:bg-studio-bg rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-studio-text-muted" />
                  </button>
                </div>

                {/* Theme */}
                {issue.themeDescription && (
                  <p className="text-sm text-studio-text-secondary mb-4 line-clamp-2">
                    {issue.themeDescription}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-studio-text-secondary">Articles</span>
                    <span className="font-medium text-studio-text-primary">
                      {completedArticles.length} / {issueArticles.length}
                    </span>
                  </div>
                  <div className="w-full bg-studio-bg rounded-full h-2">
                    <div
                      className="bg-brand-blue rounded-full h-2 transition-all"
                      style={{
                        width: issueArticles.length > 0
                          ? `${(completedArticles.length / issueArticles.length) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* Articles List */}
                {issueArticles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-studio-text-muted">
                      <BookOpen className="w-4 h-4" />
                      <span>Articles in this issue:</span>
                    </div>
                    <div className="space-y-1">
                      {issueArticles.slice(0, 3).map((article) => (
                        <div
                          key={article.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {article.status === "approved" || article.status === "published" ? (
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}
                          <span className="text-studio-text-secondary line-clamp-1">
                            {article.title}
                          </span>
                        </div>
                      ))}
                      {issueArticles.length > 3 && (
                        <p className="text-xs text-studio-text-muted pl-5">
                          +{issueArticles.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {issueArticles.length === 0 && (
                  <div className="text-center py-4 text-sm text-studio-text-muted">
                    No articles assigned yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-studio-border flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-display font-semibold">
                {editingIssue ? "Edit Issue" : "Create New Issue"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-studio-bg rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Issue Number *</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.issueNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, issueNumber: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>

                <div>
                  <label className="label">Publish Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.publishDate}
                    onChange={(e) =>
                      setFormData({ ...formData, publishDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">Issue Title *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., January 2026 - Tech Transformation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Theme Description</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Brief description of this issue's theme or focus..."
                  value={formData.themeDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, themeDescription: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  className="select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as IssueStatus })
                  }
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Internal notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-studio-border flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !formData.title?.trim()} className="btn-primary">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingIssue ? "Save Changes" : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
