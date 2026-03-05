"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { VersionTimeline } from "@/components/shared/VersionTimeline";
import { FeedbackPanel } from "@/components/shared/FeedbackPanel";
import { ApprovalBar } from "@/components/shared/ApprovalBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchAPI } from "@/lib/api";
import type { AssetStatus } from "@/lib/status-machine";

interface AssetData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  subtype: string | null;
  status: string;
  platform: string | null;
  currentVersion: number;
  metadata: string | null;
  versions: {
    id: string;
    version: number;
    filePath: string | null;
    content: string | null;
    changelog: string | null;
    metadata: string | null;
    createdAt: string;
    feedbacks: {
      id: string;
      author: string;
      type: string;
      comment: string;
      createdAt: string;
    }[];
  }[];
  brandChecks: {
    id: string;
    checkType: string;
    score: number | null;
    passed: boolean;
    details: string;
    versionNumber: number;
  }[];
}

function safeParse(json: string | null) {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  linkedin: { bg: "bg-blue-50", text: "text-blue-700" },
  instagram: { bg: "bg-pink-50", text: "text-pink-700" },
  twitter: { bg: "bg-sky-50", text: "text-sky-700" },
  facebook: { bg: "bg-indigo-50", text: "text-indigo-700" },
};

export default function SocialPostDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [asset, setAsset] = useState<AssetData | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const fetchAsset = useCallback(async () => {
    const res = await fetchAPI(`/api/assets/${id}`);
    if (res.ok) {
      const data = await res.json();
      setAsset(data);
      if (selectedVersion === null) setSelectedVersion(data.currentVersion);
    }
  }, [id, selectedVersion]);

  useEffect(() => { fetchAsset(); }, [fetchAsset]);

  if (!asset) return <div className="text-muted-foreground text-sm">Loading...</div>;

  const currentVersionData = asset.versions.find((v) => v.version === selectedVersion);
  const meta = safeParse(asset.metadata);
  const versionMeta = safeParse(currentVersionData?.metadata ?? null);
  const platformStyle = PLATFORM_COLORS[asset.platform ?? ""] ?? { bg: "bg-gray-50", text: "text-gray-700" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-lg">{asset.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            {asset.platform && (
              <span className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${platformStyle.bg} ${platformStyle.text}`}>
                {asset.platform}
              </span>
            )}
            {asset.subtype && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">
                {asset.subtype.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Post metadata */}
          {meta && (
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {meta.post_type && (
                  <div>
                    <span className="text-muted-foreground">Format:</span>{" "}
                    <span className="font-medium capitalize">{meta.post_type.replace(/_/g, " ")}</span>
                  </div>
                )}
                {meta.target_audience && (
                  <div>
                    <span className="text-muted-foreground">Audience:</span>{" "}
                    <span className="font-medium">{meta.target_audience}</span>
                  </div>
                )}
                {meta.hashtags && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Hashtags:</span>{" "}
                    <span className="font-medium text-[#006828]">{meta.hashtags}</span>
                  </div>
                )}
                {meta.scheduled_time && (
                  <div>
                    <span className="text-muted-foreground">Scheduled:</span>{" "}
                    <span className="font-medium">{meta.scheduled_time}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Post content */}
          <Card className="p-6">
            {currentVersionData?.content ? (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {currentVersionData.content}
              </pre>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                No content for this version
              </div>
            )}
          </Card>

          {/* Version metadata */}
          {versionMeta && (
            <div className="flex gap-4 text-xs text-muted-foreground">
              {versionMeta.word_count && <span>Words: {versionMeta.word_count}</span>}
              {versionMeta.character_count && <span>Characters: {versionMeta.character_count}</span>}
              {versionMeta.model && <span className="text-violet-600 font-mono">{versionMeta.model}</span>}
            </div>
          )}

          <ApprovalBar
            assetId={asset.id}
            currentStatus={asset.status as AssetStatus}
            onTransition={async (newStatus) => {
              await fetch(`/api/assets/${asset.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newStatus }),
              });
              fetchAsset();
            }}
          />

          <FeedbackPanel
            assetId={asset.id}
            onSubmit={async (data) => {
              await fetch(`/api/assets/${asset.id}/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, versionId: currentVersionData?.id }),
              });
              fetchAsset();
            }}
          />
        </div>

        <div>
          <h3 className="font-heading font-medium text-sm mb-3">Versions</h3>
          <VersionTimeline
            versions={asset.versions}
            assetType="social_post"
            currentVersion={selectedVersion ?? asset.currentVersion}
            onVersionSelect={setSelectedVersion}
          />
        </div>
      </div>
    </div>
  );
}
