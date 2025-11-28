"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Copy, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, AlertTriangle, Scale } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CommunityNote } from "@/lib/dkg-schema"

interface TopicDetailViewProps {
  topicId: string
}

export function TopicDetailView({ topicId }: TopicDetailViewProps) {
  const [communityNote, setCommunityNote] = useState<CommunityNote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadCommunityNote()
  }, [topicId])

  const loadCommunityNote = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to load from localStorage first
      const storedData = localStorage.getItem(`community-note-${topicId}`)
      if (storedData) {
        const data = JSON.parse(storedData)
        setCommunityNote(data.communityNote)
        setIsLoading(false)
        return
      }

      // If not in localStorage, try to fetch from API
      const response = await fetch(`/api/community-note/${topicId}`)
      if (!response.ok) {
        throw new Error("Community Note not found")
      }

      const result = await response.json()
      setCommunityNote(result.communityNote)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Community Note")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    })
  }

  const copyJSON = () => {
    if (communityNote) {
      navigator.clipboard.writeText(JSON.stringify(communityNote, null, 2))
      toast({
        title: "Copied",
        description: "JSON-LD copied to clipboard",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4" />
            <p className="text-muted-foreground">Loading Community Note...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !communityNote) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <Card className="border-critical/30 bg-critical/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-critical mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-critical mb-2">Community Note Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  {error || "The requested Community Note could not be loaded."}
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={loadCommunityNote}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Link href="/community-notes">
                    <Button>View All Notes</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const explorerUrl = `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(topicId)}`

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{communityNote.claimReviewed}</h1>
              <p className="text-muted-foreground">
                Published {new Date(communityNote.datePublished).toLocaleDateString()}
              </p>
            </div>
            <TrustBadge score={communityNote.trustScore} verdict={communityNote.verdict} />
          </div>

          {/* UAL Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-2">Universal Asset Locator (UAL)</p>
                  <code className="text-sm font-mono bg-muted px-3 py-2 rounded-md block overflow-x-auto">
                    {topicId}
                  </code>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(topicId, "UAL")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="segments">Segments ({communityNote.segments.length})</TabsTrigger>
            <TabsTrigger value="json">JSON-LD</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Trust Score"
                value={`${communityNote.trustScore}/100`}
                icon={<Scale className="h-5 w-5 text-primary" />}
              />
              <StatCard
                label="Verdict"
                value={communityNote.verdict.replace(/_/g, " ")}
                icon={<CheckCircle2 className="h-5 w-5 text-success" />}
                capitalize
              />
              <StatCard
                label="Segments Analyzed"
                value={communityNote.segments.length.toString()}
                icon={<AlertTriangle className="h-5 w-5 text-warning" />}
              />
            </div>

            {/* Rating Explanation */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{communityNote.reviewRating.ratingExplanation}</p>
              </CardContent>
            </Card>

            {/* Reviewed Item */}
            <Card>
              <CardHeader>
                <CardTitle>Reviewed Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Title:</span>
                  <p className="font-medium">{communityNote.itemReviewed.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Author:</span>
                  <p className="font-medium">{communityNote.itemReviewed.author}</p>
                </div>
                {communityNote.itemReviewed.url && (
                  <div>
                    <span className="text-sm text-muted-foreground">URL:</span>
                    <a
                      href={communityNote.itemReviewed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline block truncate"
                    >
                      {communityNote.itemReviewed.url}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Methodology:</span>
                  <p className="text-sm">{communityNote.methodology}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            {communityNote.segments.map((segment, index) => (
              <Card key={segment.segment}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">Segment {index + 1}</CardTitle>
                      <Badge variant={getClassificationVariant(segment.classification)}>
                        {segment.classification.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Similarity</div>
                      <div className="text-lg font-semibold">{(segment.similarityScore * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Claim Text */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Claim:</p>
                    <p className="text-sm leading-relaxed">{segment.text}</p>
                  </div>

                  {/* Hallucination Probability */}
                  {segment.hallucinationProbability > 0.5 && (
                    <div className="rounded-lg border border-critical/30 bg-critical/5 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-critical" />
                        <span className="text-sm font-medium text-critical">
                          High Hallucination Risk ({(segment.hallucinationProbability * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Explanation:</p>
                    <p className="text-sm leading-relaxed">{segment.explanation}</p>
                  </div>

                  {/* Evidence */}
                  {segment.evidence.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Evidence:</p>
                      <div className="space-y-2">
                        {segment.evidence.map((ev, evIndex) => (
                          <div key={evIndex} className="rounded-lg border border-border bg-muted/30 p-3">
                            <p className="text-sm mb-2">{ev.snippet}</p>
                            <div className="flex items-center justify-between text-xs">
                              <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate"
                              >
                                {ev.url}
                              </a>
                              <span className="text-muted-foreground ml-2">
                                Confidence: {(ev.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="json">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>JSON-LD Schema</CardTitle>
                <Button size="sm" variant="outline" onClick={copyJSON}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{JSON.stringify(communityNote, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">compareDKG</span>
        </Link>
        <Link href="/community-notes">
          <Button variant="outline" size="sm" className="h-9 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Notes
          </Button>
        </Link>
      </div>
    </header>
  )
}

function TrustBadge({ score, verdict }: { score: number; verdict: string }) {
  const getColor = () => {
    if (score >= 80) return "text-success border-success bg-success/10"
    if (score >= 60) return "text-warning border-warning bg-warning/10"
    return "text-critical border-critical bg-critical/10"
  }

  return (
    <div className={`rounded-xl border-2 px-6 py-3 text-center ${getColor()}`}>
      <div className="text-3xl font-bold">{score}</div>
      <div className="text-xs uppercase tracking-wide mt-1">{verdict.replace(/_/g, " ")}</div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  capitalize,
}: {
  label: string
  value: string
  icon: React.ReactNode
  capitalize?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-lg font-semibold ${capitalize ? "capitalize" : ""}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getClassificationVariant(classification: string): "default" | "secondary" | "destructive" | "outline" {
  switch (classification) {
    case "aligned":
      return "default"
    case "missing_context":
      return "secondary"
    case "conflict":
    case "unsupported":
      return "destructive"
    default:
      return "outline"
  }
}
