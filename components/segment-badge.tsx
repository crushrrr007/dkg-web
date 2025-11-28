import { cn } from "@/lib/utils"
import { Check, AlertTriangle, X, HelpCircle } from "lucide-react"

interface SegmentBadgeProps {
  classification: "aligned" | "missing_context" | "conflict" | "unsupported"
  size?: "sm" | "md"
}

export function SegmentBadge({ classification, size = "md" }: SegmentBadgeProps) {
  const configs = {
    aligned: {
      label: "Aligned",
      icon: Check,
      bgColor: "bg-aligned/10",
      textColor: "text-aligned",
      borderColor: "border-aligned/30",
    },
    missing_context: {
      label: "Missing Context",
      icon: AlertTriangle,
      bgColor: "bg-missing/10",
      textColor: "text-missing",
      borderColor: "border-missing/30",
    },
    conflict: {
      label: "Conflict",
      icon: X,
      bgColor: "bg-conflict/10",
      textColor: "text-conflict",
      borderColor: "border-conflict/30",
    },
    unsupported: {
      label: "Unsupported",
      icon: HelpCircle,
      bgColor: "bg-unsupported/10",
      textColor: "text-unsupported",
      borderColor: "border-unsupported/30",
    },
  }

  const config = configs[classification]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-medium",
        config.bgColor,
        config.textColor,
        config.borderColor,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  )
}
