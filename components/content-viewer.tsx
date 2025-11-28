"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, BookOpen, Bot } from "lucide-react"
import type { ContentData, Issue } from "@/lib/analysis-schema"

interface ContentViewerProps {
  source: "gorkpedia" | "wikipedia"
  content: ContentData | null
  issues: Issue[]
}

export function ContentViewer({ source, content, issues }: ContentViewerProps) {
  const isGorkpedia = source === "gorkpedia"
  const Icon = isGorkpedia ? Bot : BookOpen
  const issueCount = issues.length

  if (!content || !content.content) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Icon className={`h-5 w-5 ${isGorkpedia ? "text-gorkpedia" : "text-wikipedia"}`} />
            {isGorkpedia ? "Gorkpedia" : "Wikipedia"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {content?.title ? (
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">{content.title}</h3>
                <p>No content available</p>
              </div>
            ) : (
              "No content available"
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-border bg-card ${isGorkpedia && issueCount > 0 ? "ring-1 ring-warning/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Icon className={`h-5 w-5 ${isGorkpedia ? "text-gorkpedia" : "text-wikipedia"}`} />
            {isGorkpedia ? "Gorkpedia" : "Wikipedia"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isGorkpedia && issueCount > 0 && (
              <Badge variant="outline" className="border-warning text-warning">
                {issueCount} {issueCount === 1 ? "issue" : "issues"}
              </Badge>
            )}
            {content.url && (
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mt-2">{content.title}</h3>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {content.content.slice(0, 5000)}
              {content.content.length > 5000 && "..."}
            </p>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
