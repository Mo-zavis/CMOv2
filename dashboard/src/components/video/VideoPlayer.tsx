"use client";

import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  label?: string;
}

export function VideoPlayer({ src, poster, label }: VideoPlayerProps) {
  return (
    <Card className="p-0 overflow-hidden">
      {label && (
        <div className="px-3 py-2 border-b bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
      <video
        src={src}
        poster={poster}
        controls
        className="w-full max-h-[400px] bg-black"
        preload="metadata"
      />
    </Card>
  );
}
