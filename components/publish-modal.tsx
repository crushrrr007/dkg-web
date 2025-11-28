"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, Copy, ExternalLink, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { AnalysisResult, ContentData } from "@/lib/analysis-schema"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  analysisResult: AnalysisResult
  gorkpediaContent: ContentData
  wikipediaContent: ContentData
  topic: string
}

export function PublishModal({
  isOpen,
  onClose,
  analysisResult,
  gorkpediaContent,
  wikipediaContent,
  topic,
}: PublishModalProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{
    ual: string
    explorerUrl: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handlePublish = async () => {
    setIsPublishing(true)
    setError(null)

    try {
      const response = await fetch("/api/community-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisResult,
          gorkpediaContent,
          wikipediaContent,
          topic,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to publish")
      }

      setPublishResult({
        ual: result.ual,
        explorerUrl: result.explorerUrl,
      })

      localStorage.setItem(
        `community-note-${result.ual}`,
        JSON.stringify({
          ual: result.ual,
          topic,
          trustScore: analysisResult.summary.overallScore,
          verdict: analysisResult.summary.verdict,
          timestamp: new Date().toISOString(),
          communityNote: result.communityNote,
        }),
      )

      const history = JSON.parse(localStorage.getItem("activity-history") || "[]")
      history.unshift({
        ual: result.ual,
        topic,
        trustScore: analysisResult.summary.overallScore,
        verdict: analysisResult.summary.verdict,
        timestamp: new Date().toISOString(),
        status: "confirmed",
      })
      localStorage.setItem("activity-history", JSON.stringify(history.slice(0, 50))) // Keep last 50

      toast({
        title: "Published Successfully",
        description: "Community Note has been published to OriginTrail DKG",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to publish"
      setError(errorMessage)
      toast({
        title: "Publishing Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "UAL copied to clipboard",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publish Community Note to DKG</DialogTitle>
          <DialogDescription>
            This will create a verifiable Community Note and publish it to the OriginTrail Decentralized Knowledge
            Graph.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Topic:</span>
              <span className="font-medium">{topic}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trust Score:</span>
              <span className="font-medium">{analysisResult.summary.overallScore}/100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verdict:</span>
              <span className="font-medium capitalize">{analysisResult.summary.verdict.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Issues:</span>
              <span className="font-medium">{analysisResult.summary.totalIssues}</span>
            </div>
          </div>

          {/* Publishing State */}
          {!publishResult && !error && (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                The Community Note will be published to the OriginTrail testnet with a unique UAL (Universal Asset
                Locator) for blockchain verification.
              </p>
            </div>
          )}

          {/* Success State */}
          {publishResult && (
            <div className="space-y-4 rounded-lg border border-success/30 bg-success/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-success mb-2">Published Successfully!</p>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Universal Asset Locator (UAL)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={publishResult.ual}
                          readOnly
                          className="flex-1 font-mono text-xs h-9 bg-background"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(publishResult.ual)}
                          className="h-9"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1 bg-transparent" variant="outline">
                        <a href={publishResult.explorerUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          DKG Explorer
                        </a>
                      </Button>
                      <Button asChild className="flex-1">
                        <Link href={`/topics/${publishResult.ual}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-critical/30 bg-critical/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-critical mt-0.5" />
                <div>
                  <p className="font-medium text-critical mb-1">Publishing Failed</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {!publishResult ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isPublishing}>
                Cancel
              </Button>
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish to DKG"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
