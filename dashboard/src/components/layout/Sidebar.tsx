"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/", icon: "grid" },
      { label: "Command Center", href: "/command-center", icon: "zap" },
    ],
  },
  {
    section: "Create",
    items: [
      { label: "Images", href: "/images", icon: "image" },
      { label: "Content", href: "/content", icon: "file-text" },
      { label: "Videos", href: "/videos", icon: "video" },
    ],
  },
  {
    section: "Distribute",
    items: [
      { label: "Ads", href: "/ads", icon: "megaphone" },
      { label: "Social", href: "/social", icon: "share" },
      { label: "Email", href: "/emails", icon: "mail" },
    ],
  },
  {
    section: "Plan",
    items: [
      { label: "Campaigns", href: "/campaigns", icon: "target" },
      { label: "Calendar", href: "/calendar", icon: "calendar" },
      { label: "Loops", href: "/loops", icon: "refresh" },
      { label: "Standups", href: "/standups", icon: "users" },
      { label: "Analytics", href: "/analytics", icon: "bar-chart" },
    ],
  },
  {
    section: "Library",
    items: [{ label: "All Assets", href: "/library", icon: "folder" }],
  },
  {
    section: "System",
    items: [
      { label: "Ecosystem", href: "/ecosystem", icon: "network" },
      { label: "Skill Map", href: "/skills", icon: "sparkles" },
      { label: "Status", href: "/status", icon: "clipboard-check" },
    ],
  },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </svg>
  ),
  "file-text": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  ),
  megaphone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  share: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  target: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  "bar-chart": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  folder: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  ),
  network: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" /><line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" />
    </svg>
  ),
  zap: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  refresh: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    </svg>
  ),
  sparkles: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "clipboard-check": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-56 h-screen bg-white flex flex-col fixed left-0 top-0 z-50 transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
      style={{ borderRight: "1px solid #ecebe8" }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <span className="font-heading text-xl font-semibold tracking-tight">
          <span className="text-[#006828]">Zavis</span>{" "}
          <span className="text-[#1c1c1c]/50 font-normal text-sm">CMO</span>
        </span>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md hover:bg-[#f8f8f6] text-[#1c1c1c]/50 transition-colors"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_ITEMS.map((section, sectionIndex) => (
          <div
            key={section.section}
            className={`${
              sectionIndex < NAV_ITEMS.length - 1
                ? "pb-3 mb-3 border-b border-[#ecebe8]"
                : ""
            }`}
          >
            <p className="text-[11px] uppercase tracking-wider text-[#1c1c1c]/40 font-semibold px-3 mb-2">
              {section.section}
            </p>
            {section.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-[#006828]/10 text-[#006828] font-medium border-l-2 border-[#006828]"
                      : "text-[#1c1c1c]/60 hover:text-[#1c1c1c] hover:bg-[#f8f8f6]"
                  }`}
                >
                  <span className={isActive ? "text-[#006828]" : ""}>
                    {ICONS[item.icon]}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3.5 border-t border-[#ecebe8]">
        <div className="flex items-center gap-2.5 text-xs text-[#1c1c1c]/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006828] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006828]"></span>
          </span>
          Runtime Connected
        </div>
      </div>
    </aside>
  );
}
