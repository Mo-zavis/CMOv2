"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { fetchAPI } from "@/lib/api";

interface AccountInfo {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
}

interface ConnectionResponse {
  connected: boolean;
  account: AccountInfo | null;
  error?: string;
}

export function GoogleAdsConnectionBanner() {
  const [data, setData] = useState<ConnectionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConnection = useCallback(async () => {
    try {
      const res = await fetchAPI("/api/google-ads/connection");
      const json: ConnectionResponse = await res.json();
      setData(json);
    } catch {
      setData({ connected: false, account: null, error: "Failed to reach API" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  if (loading) return null;

  if (!data?.connected) {
    return (
      <Card className="p-4 border-amber-200 bg-amber-50/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">
              Google Ads not connected
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Run{" "}
              <code className="bg-amber-100 px-1 rounded text-[11px]">
                npx tsx scripts/google-ads-setup.ts guide
              </code>{" "}
              to configure credentials.
            </p>
            {data?.error && (
              <p className="text-[10px] text-amber-500 mt-1 font-mono">{data.error}</p>
            )}
          </div>
          <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        </div>
      </Card>
    );
  }

  const account = data.account;
  const formattedId = account
    ? account.customerId.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
    : "";

  return (
    <Card className="p-4 border-green-200 bg-green-50/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4285F4] flex items-center justify-center text-white text-xs font-bold shrink-0">
            G
          </div>
          <div>
            <p className="text-sm font-medium">
              {account?.descriptiveName || "Google Ads"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formattedId}
              {account?.currencyCode && ` / ${account.currencyCode}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-medium">
            Connected
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        </div>
      </div>
    </Card>
  );
}
