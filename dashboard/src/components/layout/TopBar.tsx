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

export function TopBar() {
  const pathname = usePathname();
  const { title } = getBreadcrumb(pathname);

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="font-heading text-base font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Zavis Marketing</span>
      </div>
    </header>
  );
}
