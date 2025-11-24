import Link from "next/link";
import {
  Sparkles,
  FileText,
  Linkedin,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

// Stats card component
function StatCard({
  label,
  value,
  subtext,
  trend,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-studio-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-display font-semibold text-studio-text-primary">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-studio-text-muted mt-1 flex items-center gap-1">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
          {subtext}
        </p>
      )}
    </div>
  );
}

// Quick action button
function QuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card p-5 hover:shadow-card transition-shadow duration-200 group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-studio-accent-blueSoft flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-brand-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-studio-text-primary group-hover:text-brand-blue transition-colors">
            {label}
          </h3>
          <p className="text-sm text-studio-text-muted mt-0.5">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-studio-text-muted group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

// Activity item
function ActivityItem({
  title,
  action,
  time,
  status,
}: {
  title: string;
  action: string;
  time: string;
  status?: "draft" | "approved" | "published";
}) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-600",
    approved: "bg-green-50 text-green-600",
    published: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-studio-text-primary truncate">
          {title}
        </p>
        <p className="text-xs text-studio-text-muted">{action}</p>
      </div>
      {status && (
        <span className={`badge ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
      <span className="text-xs text-studio-text-muted whitespace-nowrap">
        {time}
      </span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-semibold text-studio-text-primary">
          Welcome back, Jerri
        </h1>
        <p className="text-studio-text-secondary mt-1">
          Here&apos;s what&apos;s happening with Inflections
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Articles This Month"
          value={12}
          subtext="4 more than last month"
          trend="up"
        />
        <StatCard
          label="LinkedIn Posts"
          value={28}
          subtext="Scheduled for this week"
        />
        <StatCard
          label="Pending Review"
          value={5}
          subtext="Awaiting approval"
        />
        <StatCard
          label="Topics in Bank"
          value={23}
          subtext="Ready to develop"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-display font-semibold text-studio-text-primary mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <QuickAction
            href="/generate"
            icon={Sparkles}
            label="Generate Article"
            description="Create a new article with AI assistance"
          />
          <QuickAction
            href="/generate/linkedin"
            icon={Linkedin}
            label="Create LinkedIn Post"
            description="Generate social content for your brands"
          />
          <QuickAction
            href="/topics"
            icon={FileText}
            label="Review Topics"
            description="Check and approve suggested topics"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Publishing */}
        <div className="card">
          <div className="px-5 py-4 border-b border-studio-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-studio-text-primary">
              Publishing Queue
            </h2>
            <Link
              href="/calendar"
              className="text-sm text-brand-blue hover:underline"
            >
              View calendar
            </Link>
          </div>
          <div className="px-5 py-2 divide-y divide-studio-border">
            <ActivityItem
              title="The State of Disaster Recovery in 2026"
              action="Scheduled for Jan 6"
              time="In 2 days"
              status="approved"
            />
            <ActivityItem
              title="Why Your PMO Needs Visibility First"
              action="Scheduled for Jan 8"
              time="In 4 days"
              status="approved"
            />
            <ActivityItem
              title="FCRA Updates: What Changed in 2025"
              action="Draft ready for review"
              time="Jan 6 target"
              status="draft"
            />
            <ActivityItem
              title="Returning to Tech: A 2026 Roadmap"
              action="In progress"
              time="Jan 6 target"
              status="draft"
            />
          </div>
          <div className="px-5 py-3 border-t border-studio-border">
            <Link
              href="/articles?status=scheduled"
              className="text-sm text-brand-blue hover:underline flex items-center gap-1"
            >
              View all scheduled
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="px-5 py-4 border-b border-studio-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-studio-text-primary">
              Recent Activity
            </h2>
            <Clock className="w-4 h-4 text-studio-text-muted" />
          </div>
          <div className="px-5 py-2 divide-y divide-studio-border">
            <ActivityItem
              title="LinkedIn post published"
              action="Unlimited Powerhouse · Hot take on AWS outage"
              time="2h ago"
              status="published"
            />
            <ActivityItem
              title="Article approved"
              action="The Fractional CIO Model"
              time="Yesterday"
              status="approved"
            />
            <ActivityItem
              title="5 new topics suggested"
              action="AI-generated from trend monitoring"
              time="Yesterday"
            />
            <ActivityItem
              title="Issue #2 planned"
              action="Theme: The Human Factor"
              time="2 days ago"
            />
          </div>
          <div className="px-5 py-3 border-t border-studio-border">
            <Link
              href="/activity"
              className="text-sm text-brand-blue hover:underline flex items-center gap-1"
            >
              View all activity
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Overview */}
      <div className="mt-6 card">
        <div className="px-5 py-4 border-b border-studio-border">
          <h2 className="font-display font-semibold text-studio-text-primary">
            Content by Brand
          </h2>
        </div>
        <div className="p-5 grid grid-cols-4 gap-4">
          {[
            { name: "Unlimited Powerhouse", count: 8, color: "#0020C2" },
            { name: "Jerri Bland", count: 6, color: "#FFA300" },
            { name: "AgentPMO", count: 4, color: "#10B981" },
            { name: "Vetters Group", count: 4, color: "#6366F1" },
            { name: "Lumynr", count: 3, color: "#F22080" },
            { name: "Prept", count: 2, color: "#8B5CF6" },
            { name: "GenAIrate", count: 2, color: "#F59E0B" },
            { name: "ISSA", count: 1, color: "#14B8A6" },
          ].map((brand) => (
            <div
              key={brand.name}
              className="flex items-center gap-3 p-3 rounded-lg bg-studio-bg"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: brand.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-studio-text-primary truncate">
                  {brand.name}
                </p>
              </div>
              <span className="text-sm text-studio-text-muted">
                {brand.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
