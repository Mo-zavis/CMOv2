"use client";

import { usePathname } from "next/navigation";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/images": "Images",
  "/content": "Content",
  "/videos": "Videos",
  "/ads": "Ad Campaigns",
  "/social": "Social Media",
  "/emails": "Email Marketing",
  "/campaigns": "Campaigns",
  "/calendar": "Calendar",
  "/analytics": "Analytics",
  "/library": "Asset Library",
  "/ecosystem": "Ecosystem",
  "/skills": "Skill Map",
};

function getBreadcrumb(pathname: string): { title: string; parent?: string } {
  // Check for detail pages like /images/[id]
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const parentPath = `/${segments[0]}`;
    return {
      title: ROUTE_TITLES[parentPath] ?? segments[0],
      parent: parentPath,
    };
  }
  return { title: ROUTE_TITLES[pathname] ?? "Dashboard" };
}

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const { title } = getBreadcrumb(pathname);

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded hover:bg-muted text-muted-foreground"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="font-heading text-base font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground hidden sm:block">Zavis Marketing</span>
      </div>
    </header>
  );
}
