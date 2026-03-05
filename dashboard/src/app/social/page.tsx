"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  PLATFORMS,
  PRIMARY_PLATFORMS,
  SECONDARY_PLATFORMS,
  getPlatformMeta,
} from "@/lib/social-platforms";

interface Integration {
  id: string;
  name: string;
  identifier: string;
  picture: string;
  disabled: boolean;
  profile: string;
  customer: { id: string; name: string };
}

interface ApiResponse {
  connected: boolean;
  integrations: Integration[];
  error?: string;
}

const POSTIZ_URL = "http://localhost:4007";

export default function SocialPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch("/api/social/integrations");
      const json: ApiResponse = await res.json();
      setData(json);
    } catch {
      setData({ connected: false, integrations: [], error: "Failed to reach API" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const connectedIds = new Set(data?.integrations.map((i) => i.identifier) ?? []);

  const unconnectedPrimary = PRIMARY_PLATFORMS.filter((p) => !connectedIds.has(p.id));
  const unconnectedSecondary = SECONDARY_PLATFORMS.filter((p) => !connectedIds.has(p.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-base">Socials Connected</h2>
        <a
          href={POSTIZ_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#006828] hover:underline font-medium"
        >
          Open Postiz Dashboard
        </a>
      </div>

      {/* Loading */}
      {loading && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-sm">Loading social integrations...</p>
        </Card>
      )}

      {/* Error / Not connected */}
      {!loading && !data?.connected && (
        <Card className="p-8 text-center border-amber-200 bg-amber-50/50">
          <p className="text-sm font-medium text-amber-800 mb-2">
            Could not connect to Postiz
          </p>
          <p className="text-xs text-amber-600">
            Make sure Postiz is running at {POSTIZ_URL} and your API key is configured in{" "}
            <code className="bg-amber-100 px-1 rounded">.env</code>.
          </p>
          {data?.error && (
            <p className="text-[10px] text-amber-500 mt-2 font-mono">{data.error}</p>
          )}
        </Card>
      )}

      {/* Connected accounts */}
      {!loading && data?.connected && (
        <>
          {data.integrations.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Connected Accounts ({data.integrations.length})
              </p>
              <div className="grid grid-cols-3 gap-4">
                {data.integrations.map((integration) => {
                  const meta = getPlatformMeta(integration.identifier);
                  return (
                    <Card key={integration.id} className="p-4 relative">
                      <div className="flex items-start gap-3">
                        {/* Platform avatar */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0"
                          style={{ backgroundColor: meta.color }}
                        >
                          {meta.name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {meta.name}
                            </p>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                integration.disabled
                                  ? "bg-red-50 text-red-600 border border-red-200"
                                  : "bg-green-50 text-green-700 border border-green-200"
                              }`}
                            >
                              {integration.disabled ? "Disabled" : "Connected"}
                            </span>
                          </div>

                          {/* Account name */}
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {integration.name || integration.profile}
                          </p>

                          {/* Profile handle */}
                          {integration.profile && integration.profile !== integration.name && (
                            <p className="text-[10px] text-muted-foreground/70 truncate">
                              @{integration.profile}
                            </p>
                          )}
                        </div>

                        {/* Profile picture */}
                        {integration.picture && (
                          <img
                            src={integration.picture}
                            alt=""
                            className="w-8 h-8 rounded-full shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Not connected: Primary */}
          {unconnectedPrimary.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Not Connected
              </p>
              <div className="grid grid-cols-3 gap-4">
                {unconnectedPrimary.map((platform) => (
                  <Card
                    key={platform.id}
                    className="p-4 opacity-50 hover:opacity-70 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{platform.name}</p>
                        <a
                          href={POSTIZ_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#006828] hover:underline"
                        >
                          Connect in Postiz
                        </a>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                        Not Connected
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Not connected: Secondary */}
          {unconnectedSecondary.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Other Platforms
              </p>
              <div className="grid grid-cols-4 gap-3">
                {unconnectedSecondary.map((platform) => (
                  <Card
                    key={platform.id}
                    className="p-3 opacity-40 hover:opacity-60 transition-opacity"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center text-white font-semibold text-[10px] shrink-0"
                        style={{ backgroundColor: platform.color }}
                      >
                        {platform.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{platform.name}</p>
                        <a
                          href={POSTIZ_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-[#006828] hover:underline"
                        >
                          Connect
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {data.integrations.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No social accounts connected yet.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Open Postiz to connect your social media accounts, then return here to see
                their status.
              </p>
              <a
                href={POSTIZ_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white bg-[#006828] hover:bg-[#005520] px-4 py-2 rounded-md font-medium transition-colors"
              >
                Open Postiz
              </a>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
