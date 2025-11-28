"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, Brain, Scale, FileQuestion, Clock, Lightbulb, HelpCircle } from "lucide-react"
import type { Issue, Severity, IssueType } from "@/lib/analysis-schema"

interface IssueCardProps {
  issue: Issue
}

export function IssueCard({ issue }: IssueCardProps) {
  const getSeverityConfig = (severity: Severity) => {
    switch (severity) {
      case "critical":
        return { color: "text-critical", bg: "bg-critical/10", border: "border-critical/20", label: "Critical" }
      case "high":
        return { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", label: "High" }
      case "medium":
        return { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/20", label: "Medium" }
      case "low":
        return { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-muted", label: "Low" }
      default:
        return { color: "text-muted-foreground", bg: "bg-muted/50", border: "border-muted", label: "Unknown" }
    }
  }

  const getTypeConfig = (type: IssueType) => {
    switch (type) {
      case "factual_error":
        return { icon: AlertCircle, label: "Factual Error" }
      case "hallucination":
        return { icon: Brain, label: "Hallucination" }
      case "bias":
        return { icon: Scale, label: "Bias" }
      case "missing_context":
        return { icon: FileQuestion, label: "Missing Context" }
      case "misleading":
        return { icon: AlertTriangle, label: "Misleading" }
      case "outdated":
        return { icon: Clock, label: "Outdated" }
      default:
        return { icon: HelpCircle, label: "Other" }
    }
  }

  const severityConfig = getSeverityConfig(issue.severity)
  const typeConfig = getTypeConfig(issue.type)
  const TypeIcon = typeConfig.icon

  return (
    <Card className={`border ${severityConfig.border} ${severityConfig.bg}`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${severityConfig.bg}`}>
              <TypeIcon className={`h-4 w-4 ${severityConfig.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{issue.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={`${severityConfig.color} border-current text-xs`}>
              {severityConfig.label}
            </Badge>
          </div>
        </div>

        {/* Evidence comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-card border border-gorkpedia/20">
            <span className="text-xs font-medium text-gorkpedia mb-2 block">AI Article</span>
            <p className="text-sm text-foreground italic leading-relaxed">"{issue.gorkpediaExcerpt}"</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-wikipedia/20">
            <span className="text-xs font-medium text-wikipedia mb-2 block">Wikipedia</span>
            <p className="text-sm text-foreground italic leading-relaxed">"{issue.wikipediaEvidence}"</p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-medium text-primary">Suggestion</span>
            <p className="text-sm text-foreground mt-0.5">{issue.recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
