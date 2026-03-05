export type CalendarEventType =
  | "campaign_launch"
  | "ad_start"
  | "social_post"
  | "content_publish"
  | "email_send"
  | "milestone";

export interface EventTypeMeta {
  label: string;
  color: string;
  textColor: string;
  dotColor: string;
}

export const EVENT_TYPES: Record<CalendarEventType, EventTypeMeta> = {
  campaign_launch: {
    label: "Campaign Launch",
    color: "bg-[#006828]/10",
    textColor: "text-[#006828]",
    dotColor: "#006828",
  },
  ad_start: {
    label: "Ad Go-Live",
    color: "bg-blue-50",
    textColor: "text-blue-700",
    dotColor: "#2563eb",
  },
  social_post: {
    label: "Social Post",
    color: "bg-pink-50",
    textColor: "text-pink-700",
    dotColor: "#ec4899",
  },
  content_publish: {
    label: "Content Publish",
    color: "bg-amber-50",
    textColor: "text-amber-700",
    dotColor: "#f59e0b",
  },
  email_send: {
    label: "Email Send",
    color: "bg-purple-50",
    textColor: "text-purple-700",
    dotColor: "#8b5cf6",
  },
  milestone: {
    label: "Milestone",
    color: "bg-gray-100",
    textColor: "text-gray-700",
    dotColor: "#6b7280",
  },
};

export function getEventTypeMeta(eventType: string): EventTypeMeta {
  return (
    EVENT_TYPES[eventType as CalendarEventType] ?? {
      label: eventType,
      color: "bg-gray-100",
      textColor: "text-gray-700",
      dotColor: "#6b7280",
    }
  );
}
