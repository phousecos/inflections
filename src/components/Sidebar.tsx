"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  FileText,
  Linkedin,
  Calendar,
  Lightbulb,
  Building2,
  Image,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Generate", href: "/generate", icon: Sparkles },
  { name: "Articles", href: "/articles", icon: FileText },
  { name: "LinkedIn", href: "/linkedin", icon: Linkedin },
  { name: "Topics", href: "/topics", icon: Lightbulb },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Images", href: "/images", icon: Image },
  { name: "Brands", href: "/brands", icon: Building2 },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-studio-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-studio-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">I</span>
          </div>
          <div>
            <span className="font-display font-semibold text-studio-text-primary">
              Inflections
            </span>
            <span className="text-studio-text-muted text-xs block -mt-0.5">
              Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "nav-item",
                isActive && "nav-item-active"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Secondary navigation */}
      <div className="px-3 py-4 border-t border-studio-border">
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "nav-item",
                isActive && "nav-item-active"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User section */}
      <div className="px-3 py-4 border-t border-studio-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center">
            <span className="text-white font-medium text-sm">JB</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-studio-text-primary truncate">
              Jerri Bland
            </p>
            <p className="text-xs text-studio-text-muted truncate">
              Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
