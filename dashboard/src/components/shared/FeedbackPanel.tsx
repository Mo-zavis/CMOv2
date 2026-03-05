"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FeedbackPanelProps {
  assetId: string;
  onSubmit: (data: { type: string; comment: string }) => Promise<void>;
}

export function FeedbackPanel({ assetId, onSubmit }: FeedbackPanelProps) {
  const [comment, setComment] = useState("");
  const [type, setType] = useState<"comment" | "revision">("comment");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ type, comment: comment.trim() });
      setComment("");
      setType("comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Feedback</Label>

      <div className="flex gap-2">
        <Button
          variant={type === "comment" ? "default" : "outline"}
          size="sm"
          onClick={() => setType("comment")}
          className={type === "comment" ? "bg-[#006828] hover:bg-[#006828]/90" : ""}
        >
          Comment
        </Button>
        <Button
          variant={type === "revision" ? "default" : "outline"}
          size="sm"
          onClick={() => setType("revision")}
          className={type === "revision" ? "bg-amber-600 hover:bg-amber-600/90" : ""}
        >
          Request Revision
        </Button>
      </div>

      <Textarea
        placeholder={
          type === "revision"
            ? "Describe what needs to change..."
            : "Add a comment..."
        }
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />

      <Button
        onClick={handleSubmit}
        disabled={!comment.trim() || submitting}
        size="sm"
        className="bg-[#006828] hover:bg-[#006828]/90"
      >
        {submitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </div>
  );
}
