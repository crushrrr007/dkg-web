"use client"

import { useState } from "react"
import { Shield, ChevronDown, ChevronUp, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnalysisResult } from "@/lib/analysis-schema"

interface TrustCardProps {
  result: AnalysisResult
}

export function TrustCard({ result }: TrustCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const score = result.summary.overallScore

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-warning"
    return "text-critical"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/10"
    if (score >= 60) return "bg-warning/10"
    return "bg-critical/10"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High Trust"
    if (score >= 60) return "Moderate Trust"
    return "Low Trust"
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl", getScoreBg(score))}>
            <Shield className={cn("h-6 w-6", getScoreColor(score))} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Trust Score</h3>
            <p className="text-sm text-muted-foreground">Algorithmic verification result</p>
          </div>
        </div>
      </div>

      {/* Radial progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background circle */}
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-border" />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
              className={cn("transition-all duration-1000", getScoreColor(score))}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", getScoreColor(score))}>{score}</span>
            <span className="text-xs text-muted-foreground">out of 100</span>
          </div>
        </div>
      </div>

      <div className={cn("text-center mb-4 px-4 py-2 rounded-lg", getScoreBg(score))}>
        <span className={cn("font-semibold", getScoreColor(score))}>{getScoreLabel(score)}</span>
      </div>

      {/* Explanation toggle */}
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          How it's computed
        </span>
        {showExplanation ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {showExplanation && (
        <div className="mt-4 p-4 rounded-lg bg-muted/30 text-sm space-y-2 animate-slide-up-fade">
          <p className="text-muted-foreground leading-relaxed">The trust score is calculated using multiple factors:</p>
          <ul className="space-y-1.5 text-muted-foreground ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Semantic alignment</strong> with reference content
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Factual verification</strong> against Wikipedia
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Hallucination detection</strong> probability
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>
                <strong>Evidence support</strong> for claims
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
