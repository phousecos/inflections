"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Loader2,
  Lightbulb,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  pillarLabels,
  topicSourceLabels,
  topicPriorityLabels,
  topicTimelinessLabels,
  topicStatusLabels,
} from "@/lib/utils";
import type { Topic, Brand, ContentPillar } from "@/types";

type TopicStatus = Topic["status"];
type TopicPriority = Topic["priority"];

const priorityColors: Record<TopicPriority, { bg: string; text: string }> = {
  high: { bg: "bg-red-50", text: "text-red-700" },
  medium: { bg: "bg-amber-50", text: "text-amber-700" },
  low: { bg: "bg-gray-50", text: "text-gray-600" },
};

const statusColors: Record<TopicStatus, { bg: string; text: string }> = {
  new: { bg: "bg-blue-50", text: "text-blue-700" },
  approved: { bg: "bg-green-50", text: "text-green-700" },
  assigned: { bg: "bg-purple-50", text: "text-purple-700" },
  used: { bg: "bg-gray-100", text: "text-gray-500" },
  rejected: { bg: "bg-red-50", text: "text-red-600" },
};

const pillarDescriptions: Record<string, string> = {
  tech_leadership: "Technology strategy, IT leadership, digital transformation",
  delivery_excellence: "Project management, delivery optimization, operational efficiency",
  workforce_transformation: "Talent management, team building, organizational change",
  emerging_talent: "Career development, skills training, workforce readiness",
  human_side: "Leadership psychology, workplace culture, personal effectiveness",
};

export default function TopicsBank() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Generator state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState<Array<{
    topic: string;
    description: string;
    timeliness: string;
    selected: boolean;
  }>>([]);
  const [generateForm, setGenerateForm] = useState({
    brandId: "",
    pillar: "" as ContentPillar | "",
    count: 5,
  });

  // Filters
  const [filterStatus, setFilterStatus] = useState<TopicStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TopicPriority | "all">("all");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    source: "manual" as Topic["source"],
    sourceUrl: "",
    primaryBrandId: "",
    pillar: "" as ContentPillar | "",
    priority: "medium" as Topic["priority"],
    timeliness: "evergreen" as Topic["timeliness"],
    status: "new" as Topic["status"],
    notes: "",
  });

  // Fetch topics and brands
  useEffect(() => {
    async function fetchData() {
      try {
        const [topicsRes, brandsRes] = await Promise.all([
          fetch("/api/airtable/topics"),
          fetch("/api/airtable/brands"),
        ]);

        if (!topicsRes.ok) throw new Error("Failed to fetch topics");
        if (!brandsRes.ok) throw new Error("Failed to fetch brands");

        const [topicsData, brandsData] = await Promise.all([
          topicsRes.json(),
          brandsRes.json(),
        ]);

        setTopics(topicsData);
        setBrands(brandsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter topics
  const filteredTopics = topics.filter((topic) => {
    if (filterStatus !== "all" && topic.status !== filterStatus) return false;
    if (filterPriority !== "all" && topic.priority !== filterPriority) return false;
    if (filterBrand !== "all" && topic.primaryBrandId !== filterBrand) return false;
    return true;
  });

  // Group by status for Kanban-like view
  const topicsByStatus = {
    new: filteredTopics.filter((t) => t.status === "new"),
    approved: filteredTopics.filter((t) => t.status === "approved"),
    assigned: filteredTopics.filter((t) => t.status === "assigned"),
    used: filteredTopics.filter((t) => t.status === "used"),
    rejected: filteredTopics.filter((t) => t.status === "rejected"),
  };

  const resetForm = () => {
    setFormData({
      topic: "",
      description: "",
      source: "manual",
      sourceUrl: "",
      primaryBrandId: "",
      pillar: "",
      priority: "medium",
      timeliness: "evergreen",
      status: "new",
      notes: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingTopic(null);
    setShowAddModal(true);
  };

  const openEditModal = (topic: Topic) => {
    setFormData({
      topic: topic.topic,
      description: topic.description || "",
      source: topic.source,
      sourceUrl: topic.sourceUrl || "",
      primaryBrandId: topic.primaryBrandId || "",
      pillar: topic.pillar || "",
      priority: topic.priority,
      timeliness: topic.timeliness,
      status: topic.status,
      notes: topic.notes || "",
    });
    setEditingTopic(topic);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.topic.trim()) {
      alert("Topic is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        pillar: formData.pillar || undefined,
        primaryBrandId: formData.primaryBrandId || undefined,
        secondaryBrandIds: [],
      };

      if (editingTopic) {
        // Update existing
        const response = await fetch("/api/airtable/topics", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTopic.id, ...payload }),
        });

        if (!response.ok) throw new Error("Failed to update topic");

        setTopics((prev) =>
          prev.map((t) =>
            t.id === editingTopic.id ? { ...t, ...payload } : t
          )
        );
      } else {
        // Create new
        const response = await fetch("/api/airtable/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to create topic");

        const { id } = await response.json();
        setTopics((prev) => [
          { id, ...payload, createdAt: new Date().toISOString() } as Topic,
          ...prev,
        ]);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      const response = await fetch(`/api/airtable/topics?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete topic");

      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleStatusChange = async (topic: Topic, newStatus: TopicStatus) => {
    try {
      const response = await fetch("/api/airtable/topics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: topic.id, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleGenerateTopics = async () => {
    if (!generateForm.brandId || !generateForm.pillar) {
      alert("Please select both brand and pillar");
      return;
    }

    setGenerating(true);
    try {
      const brand = brands.find((b) => b.id === generateForm.brandId);
      if (!brand) throw new Error("Brand not found");

      const response = await fetch("/api/generate/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: brand.name,
          brandVoice: brand.voiceSummary,
          targetAudience: brand.targetAudience,
          pillar: pillarLabels[generateForm.pillar],
          pillarDescription: pillarDescriptions[generateForm.pillar],
          count: generateForm.count,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate topics");

      const data = await response.json();
      setGeneratedTopics(data.topics.map((t: any) => ({ ...t, selected: true })));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveGeneratedTopics = async () => {
    const selectedTopics = generatedTopics.filter((t) => t.selected);
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic");
      return;
    }

    setGenerating(true);
    try {
      // Create topics in Airtable
      for (const genTopic of selectedTopics) {
        const response = await fetch("/api/airtable/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: genTopic.topic,
            description: genTopic.description,
            source: "ai_suggested",
            primaryBrandId: generateForm.brandId,
            pillar: generateForm.pillar,
            priority: "medium",
            timeliness: genTopic.timeliness.toLowerCase().includes("timely") ? "timely" : "evergreen",
            status: "new",
            notes: `AI suggested: ${genTopic.timeliness}`,
            secondaryBrandIds: [],
          }),
        });

        if (!response.ok) throw new Error("Failed to create topic");

        const { id } = await response.json();
        setTopics((prev) => [
          {
            id,
            topic: genTopic.topic,
            description: genTopic.description,
            source: "ai_suggested",
            primaryBrandId: generateForm.brandId,
            secondaryBrandIds: [],
            pillar: generateForm.pillar as ContentPillar,
            priority: "medium",
            timeliness: genTopic.timeliness.toLowerCase().includes("timely") ? "timely" : "evergreen",
            status: "new",
            notes: `AI suggested: ${genTopic.timeliness}`,
            createdAt: new Date().toISOString(),
          } as Topic,
          ...prev,
        ]);
      }

      setShowGenerateModal(false);
      setGeneratedTopics([]);
      setGenerateForm({ brandId: "", pillar: "", count: 5 });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setGenerating(false);
    }
  };

  const getBrandName = (brandId?: string) => {
    if (!brandId) return null;
    return brands.find((b) => b.id === brandId)?.name;
  };

  const getBrandColor = (brandId?: string) => {
    if (!brandId) return "#666";
    return brands.find((b) => b.id === brandId)?.primaryColor || "#666";
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
            Topics Bank
          </h1>
          <p className="text-studio-text-secondary mt-1">
            {filteredTopics.length} topics • {topicsByStatus.new.length} new • {topicsByStatus.approved.length} approved
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="btn-secondary"
          >
            <Sparkles className="w-4 h-4" />
            Generate Ideas
          </button>
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TopicStatus | "all")}
              >
                <option value="all">All Statuses</option>
                {Object.entries(topicStatusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as TopicPriority | "all")}
              >
                <option value="all">All Priorities</option>
                {Object.entries(topicPriorityLabels).map(([key, label]) => (
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
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-4">
        {(["new", "approved", "assigned", "used", "rejected"] as TopicStatus[]).map((status) => (
          <div key={status} className="min-h-[400px]">
            <div className={cn(
              "px-3 py-2 rounded-t-lg font-medium text-sm",
              statusColors[status].bg,
              statusColors[status].text
            )}>
              {topicStatusLabels[status]} ({topicsByStatus[status].length})
            </div>
            <div className="bg-studio-bg rounded-b-lg p-2 space-y-2 min-h-[350px]">
              {topicsByStatus[status].map((topic) => (
                <div
                  key={topic.id}
                  className="card p-3 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-medium text-studio-text-primary line-clamp-2">
                      {topic.topic}
                    </h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(topic)}
                        className="p-1 hover:bg-studio-bg rounded"
                      >
                        <Pencil className="w-3 h-3 text-studio-text-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {topic.description && (
                    <p className="text-xs text-studio-text-muted line-clamp-2 mb-2">
                      {topic.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={cn(
                      "badge text-xs",
                      priorityColors[topic.priority].bg,
                      priorityColors[topic.priority].text
                    )}>
                      {topicPriorityLabels[topic.priority]}
                    </span>
                    {topic.pillar && (
                      <span className="badge bg-studio-bg text-studio-text-secondary text-xs">
                        {pillarLabels[topic.pillar]}
                      </span>
                    )}
                  </div>

                  {topic.primaryBrandId && (
                    <div className="flex items-center gap-1 mb-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getBrandColor(topic.primaryBrandId) }}
                      />
                      <span className="text-xs text-studio-text-muted">
                        {getBrandName(topic.primaryBrandId)}
                      </span>
                    </div>
                  )}

                  {topic.sourceUrl && (
                    <a
                      href={topic.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-blue hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Source
                    </a>
                  )}

                  {/* Quick status change */}
                  {status === "new" && (
                    <div className="mt-2 pt-2 border-t border-studio-border flex gap-1">
                      <button
                        onClick={() => handleStatusChange(topic, "approved")}
                        className="flex-1 text-xs py-1 px-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(topic, "rejected")}
                        className="flex-1 text-xs py-1 px-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {status === "approved" && (
                    <Link
                      href={`/generate?topic=${encodeURIComponent(topic.topic)}&brand=${topic.primaryBrandId || ""}&pillar=${topic.pillar || ""}`}
                      className="mt-2 pt-2 border-t border-studio-border flex items-center justify-center gap-1 text-xs text-brand-blue hover:underline"
                    >
                      Use for Article
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              ))}

              {topicsByStatus[status].length === 0 && (
                <div className="text-center py-8 text-studio-text-muted text-sm">
                  No topics
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-studio-border flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold">
                {editingTopic ? "Edit Topic" : "Add New Topic"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-studio-bg rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Topic *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Why disaster recovery plans fail during real outages"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Brief description or angle for this topic..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Source</label>
                  <select
                    className="select"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as Topic["source"] })}
                  >
                    {Object.entries(topicSourceLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Source URL</label>
                  <input
                    type="url"
                    className="input"
                    placeholder="https://..."
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Primary Brand</label>
                  <select
                    className="select"
                    value={formData.primaryBrandId}
                    onChange={(e) => setFormData({ ...formData, primaryBrandId: e.target.value })}
                  >
                    <option value="">Select brand...</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Pillar</label>
                  <select
                    className="select"
                    value={formData.pillar}
                    onChange={(e) => setFormData({ ...formData, pillar: e.target.value as ContentPillar | "" })}
                  >
                    <option value="">Select pillar...</option>
                    {Object.entries(pillarLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Topic["priority"] })}
                  >
                    {Object.entries(topicPriorityLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Timeliness</label>
                  <select
                    className="select"
                    value={formData.timeliness}
                    onChange={(e) => setFormData({ ...formData, timeliness: e.target.value as Topic["timeliness"] })}
                  >
                    {Object.entries(topicTimelinessLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    className="select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Topic["status"] })}
                  >
                    {Object.entries(topicStatusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-studio-border flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingTopic ? "Save Changes" : "Add Topic"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Topics Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-studio-border flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-blue" />
                Generate Topic Ideas
              </h2>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratedTopics([]);
                }}
                className="p-2 hover:bg-studio-bg rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {generatedTopics.length === 0 ? (
                <>
                  <p className="text-studio-text-secondary">
                    Select a brand and content pillar to generate AI-powered topic suggestions.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Brand *</label>
                      <select
                        className="select"
                        value={generateForm.brandId}
                        onChange={(e) => setGenerateForm({ ...generateForm, brandId: e.target.value })}
                      >
                        <option value="">Select brand...</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label">Content Pillar *</label>
                      <select
                        className="select"
                        value={generateForm.pillar}
                        onChange={(e) => setGenerateForm({ ...generateForm, pillar: e.target.value as ContentPillar | "" })}
                      >
                        <option value="">Select pillar...</option>
                        {Object.entries(pillarLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Number of Ideas</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="input"
                      value={generateForm.count}
                      onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-studio-text-secondary">
                    Select the topics you want to add to your Topics Bank:
                  </p>
                  <div className="space-y-3">
                    {generatedTopics.map((genTopic, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-colors cursor-pointer",
                          genTopic.selected
                            ? "border-brand-blue bg-blue-50"
                            : "border-studio-border hover:border-studio-border-hover"
                        )}
                        onClick={() => {
                          setGeneratedTopics((prev) =>
                            prev.map((t, i) => (i === idx ? { ...t, selected: !t.selected } : t))
                          );
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                            genTopic.selected ? "border-brand-blue bg-brand-blue" : "border-gray-300"
                          )}>
                            {genTopic.selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-studio-text-primary mb-1">
                              {genTopic.topic}
                            </h4>
                            <p className="text-sm text-studio-text-secondary mb-2">
                              {genTopic.description}
                            </p>
                            <p className="text-xs text-studio-text-muted italic">
                              Why now: {genTopic.timeliness}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-studio-border flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratedTopics([]);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              {generatedTopics.length === 0 ? (
                <button
                  onClick={handleGenerateTopics}
                  disabled={generating || !generateForm.brandId || !generateForm.pillar}
                  className="btn-primary"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Topics
                </button>
              ) : (
                <button
                  onClick={handleSaveGeneratedTopics}
                  disabled={generating || !generatedTopics.some(t => t.selected)}
                  className="btn-primary"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Add Selected ({generatedTopics.filter(t => t.selected).length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
