"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, Download, Users, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import type { AnalysisResult, ContentData } from "@/lib/analysis-schema"

interface CommunityNoteProps {
  result: AnalysisResult
  gorkpediaContent: ContentData | null
  wikipediaContent: ContentData | null
}

export function CommunityNote({ result, gorkpediaContent, wikipediaContent }: CommunityNoteProps) {
  const [copied, setCopied] = useState(false)
  const [showJsonLd, setShowJsonLd] = useState(false)

  const { summary, issues, keyDifferences } = result

  // Generate the community note text
  const generateNoteText = () => {
    const issueCount = summary?.totalIssues || 0
    const criticalCount = summary?.criticalIssues || 0
    const verdict = summary?.verdict || "unknown"

    let noteText = ""

    // Opening statement based on verdict
    if (verdict === "unreliable" || verdict === "questionable") {
      noteText = "Readers added context they thought people might want to know:\n\n"
      noteText += `This article contains ${issueCount} potential accuracy issue${issueCount !== 1 ? "s" : ""}`
      if (criticalCount > 0) {
        noteText += `, including ${criticalCount} critical discrepanc${criticalCount !== 1 ? "ies" : "y"}`
      }
      noteText += " when compared with Wikipedia sources.\n\n"
    } else if (verdict === "mostly_reliable") {
      noteText = "Readers added context they thought people might want to know:\n\n"
      noteText += `While largely accurate, this article has ${issueCount} minor discrepanc${issueCount !== 1 ? "ies" : "y"} with Wikipedia sources.\n\n`
    } else {
      noteText = "Readers added context they thought people might want to know:\n\n"
      noteText += "This article appears to align with Wikipedia sources with no significant issues found.\n\n"
    }

    // Add top issues
    if (issues && issues.length > 0) {
      noteText += "Key findings:\n"
      const topIssues = issues.slice(0, 3)
      topIssues.forEach((issue, i) => {
        noteText += `• ${issue.title}\n`
      })
      noteText += "\n"
    }

    // Add key differences
    if (keyDifferences && keyDifferences.length > 0) {
      const topDiffs = keyDifferences.slice(0, 2)
      topDiffs.forEach((diff) => {
        noteText += `• ${diff}\n`
      })
      noteText += "\n"
    }

    // Add Wikipedia reference
    if (wikipediaContent?.url) {
      noteText += `Source: ${wikipediaContent.url}`
    } else if (wikipediaContent?.title) {
      noteText += `Reference: Wikipedia article on "${wikipediaContent.title}"`
    }

    return noteText
  }

  // Generate JSON-LD ClaimReview schema
  const generateJsonLd = () => {
    const now = new Date().toISOString()
    const issueTypes = issues?.map((i) => i.type) || []

    // Determine rating based on verdict
    let ratingValue = 3
    let alternateName = "Mixture"
    const ratingExplanation = summary?.verdictExplanation || ""

    switch (summary?.verdict) {
      case "reliable":
        ratingValue = 5
        alternateName = "True"
        break
      case "mostly_reliable":
        ratingValue = 4
        alternateName = "Mostly True"
        break
      case "questionable":
        ratingValue = 2
        alternateName = "Mostly False"
        break
      case "unreliable":
        ratingValue = 1
        alternateName = "False"
        break
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ClaimReview",
      datePublished: now,
      url: typeof window !== "undefined" ? window.location.href : "",
      author: {
        "@type": "Organization",
        name: "FactCheck Community",
        url: typeof window !== "undefined" ? window.location.origin : "",
      },
      claimReviewed: gorkpediaContent?.title
        ? `Claims made in "${gorkpediaContent.title}"`
        : "Claims in AI-generated article",
      itemReviewed: {
        "@type": "Claim",
        author: {
          "@type": "Organization",
          name: "AI Content Generator",
        },
        datePublished: gorkpediaContent?.fetchedAt || now,
        appearance: {
          "@type": "WebPage",
          url: gorkpediaContent?.url || "",
        },
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: ratingValue,
        bestRating: 5,
        worstRating: 1,
        alternateName: alternateName,
        ratingExplanation: ratingExplanation,
      },
      reviewBody: generateNoteText(),
      isBasedOn: {
        "@type": "WebPage",
        url:
          wikipediaContent?.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaContent?.title || "")}`,
        name: wikipediaContent?.title || "Wikipedia Reference",
      },
      additionalType:
        issueTypes.length > 0 ? issueTypes.map((type) => `FactCheckCategory:${type}`).join(", ") : undefined,
      reviewAspect: "Factual Accuracy",
      negativeNotes:
        issues?.map((issue) => ({
          "@type": "ListItem",
          name: issue.title,
          description: issue.description,
          category: issue.type,
          severity: issue.severity,
        })) || [],
    }

    return JSON.stringify(jsonLd, null, 2)
  }

  const noteText = generateNoteText()
  const jsonLd = generateJsonLd()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(noteText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJsonLd = () => {
    const blob = new Blob([jsonLd], { type: "application/ld+json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fact-check-${gorkpediaContent?.title?.toLowerCase().replace(/\s+/g, "-") || "analysis"}.jsonld`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getVerdictStyle = () => {
    switch (summary?.verdict) {
      case "unreliable":
      case "questionable":
        return "border-l-critical"
      case "mostly_reliable":
        return "border-l-warning"
      default:
        return "border-l-success"
    }
  }

  return (
    <Card className={`border border-note-border bg-note-bg overflow-hidden ${getVerdictStyle()} border-l-4`}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-full bg-note-icon/20">
            <Users className="h-4 w-4 text-note-icon" />
          </div>
          <span className="text-sm font-semibold text-foreground">Community Note</span>
        </div>

        {/* Note content */}
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">{noteText}</div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-note-border">
          <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs bg-transparent hover:bg-card">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1.5 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Note
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJsonLd}
            className="h-8 text-xs bg-transparent hover:bg-card"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export JSON-LD
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setShowJsonLd(!showJsonLd)} className="h-8 text-xs ml-auto">
            {showJsonLd ? (
              <>
                Hide Schema
                <ChevronUp className="h-3.5 w-3.5 ml-1.5" />
              </>
            ) : (
              <>
                View Schema
                <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>

        {/* JSON-LD Preview */}
        {showJsonLd && (
          <div className="mt-4 p-4 rounded-lg bg-card border border-border overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">JSON-LD ClaimReview Schema</span>
              <a
                href="https://schema.org/ClaimReview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                schema.org <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <pre className="text-xs text-muted-foreground font-mono overflow-x-auto">{jsonLd}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
