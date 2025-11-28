"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, AlertCircle, Info } from "lucide-react"
import type { AnalysisResult } from "@/lib/analysis-schema"

interface SummaryStatsProps {
  result: AnalysisResult
}

export function SummaryStats({ result }: SummaryStatsProps) {
  const { summary } = result

  if (!summary) {
    return null
  }

  const getVerdictConfig = () => {
    switch (summary.verdict) {
      case "reliable":
        return {
          color: "text-success",
          bgColor: "bg-success/10",
          borderColor: "border-success/20",
          label: "Reliable",
        }
      case "mostly_reliable":
        return {
          color: "text-chart-2",
          bgColor: "bg-chart-2/10",
          borderColor: "border-chart-2/20",
          label: "Mostly Reliable",
        }
      case "questionable":
        return {
          color: "text-warning",
          bgColor: "bg-warning/10",
          borderColor: "border-warning/20",
          label: "Questionable",
        }
      case "unreliable":
        return {
          color: "text-critical",
          bgColor: "bg-critical/10",
          borderColor: "border-critical/20",
          label: "Unreliable",
        }
      default:
        return {
          color: "text-muted-foreground",
          bgColor: "bg-muted/10",
          borderColor: "border-muted/20",
          label: "Unknown",
        }
    }
  }

  const verdictConfig = getVerdictConfig()
  const score = summary.overallScore || 0

  return (
    <div className="mb-6">
      <Card className={`border ${verdictConfig.borderColor} ${verdictConfig.bgColor}`}>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Score Display */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted/30"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(score / 100) * 201} 201`}
                    className={verdictConfig.color}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{score}</span>
                </div>
              </div>
              <div>
                <span className={`text-lg font-semibold ${verdictConfig.color}`}>{verdictConfig.label}</span>
                <p className="text-sm text-muted-foreground max-w-sm mt-1 leading-relaxed">
                  {summary.verdictExplanation || "Analysis complete."}
                </p>
              </div>
            </div>

            {/* Issue Counts */}
            <div className="flex-1 flex flex-wrap gap-3 md:justify-end">
              <IssueChip
                icon={AlertCircle}
                count={summary.criticalIssues || 0}
                label="Critical"
                color="text-critical"
                bg="bg-critical/10"
              />
              <IssueChip
                icon={AlertTriangle}
                count={summary.highIssues || 0}
                label="High"
                color="text-warning"
                bg="bg-warning/10"
              />
              <IssueChip
                icon={Info}
                count={summary.mediumIssues || 0}
                label="Medium"
                color="text-chart-1"
                bg="bg-chart-1/10"
              />
              <IssueChip
                icon={CheckCircle}
                count={summary.lowIssues || 0}
                label="Low"
                color="text-muted-foreground"
                bg="bg-muted/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IssueChip({
  icon: Icon,
  count,
  label,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>
  count: number
  label: string
  color: string
  bg: string
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}>
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="font-semibold text-foreground">{count}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
