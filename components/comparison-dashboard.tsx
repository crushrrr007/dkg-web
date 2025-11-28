"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { ContentViewer } from "@/components/content-viewer"
import { ComparisonResults } from "@/components/comparison-results"
import { SummaryStats } from "@/components/summary-stats"
import { CommunityNote } from "@/components/community-note"
import { PublishModal } from "@/components/publish-modal"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ArrowLeft, RefreshCw, Scale, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import type { AnalysisResult, ContentData } from "@/lib/analysis-schema"
import { constructGorkpediaUrl } from "@/lib/gorkpedia-utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ComparisonDashboard() {
  const searchParams = useSearchParams()
  const topic = searchParams.get("topic")
  const gorkpediaUrl = searchParams.get("gorkpedia")
  const wikipediaUrl = searchParams.get("wikipedia")
  const depth = (searchParams.get("depth") || "quick") as "quick" | "comprehensive"

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

  const effectiveGorkpediaUrl = gorkpediaUrl || (topic ? constructGorkpediaUrl(topic) : null)

  console.log(
    "[v0] Comparison params - topic:",
    topic,
    "gorkpediaUrl:",
    gorkpediaUrl,
    "effective:",
    effectiveGorkpediaUrl,
  )

  // Fetch Gorkpedia content
  const {
    data: gorkpediaContent,
    error: gorkpediaError,
    isLoading: gorkpediaLoading,
  } = useSWR<ContentData>(
    effectiveGorkpediaUrl ? `/api/fetch-gorkpedia?url=${encodeURIComponent(effectiveGorkpediaUrl)}` : null,
    fetcher,
  )

  // Fetch Wikipedia content
  const wikipediaParams = new URLSearchParams()
  if (topic) {
    wikipediaParams.set("topic", topic)
  } else if (gorkpediaContent?.title) {
    // Auto-detect topic from Gorkpedia article title
    wikipediaParams.set("topic", gorkpediaContent.title)
  }

  const {
    data: wikipediaContent,
    error: wikipediaError,
    isLoading: wikipediaLoading,
  } = useSWR<ContentData>(wikipediaParams.toString() ? `/api/fetch-wikipedia?${wikipediaParams}` : null, fetcher)

  // Run analysis when both contents are available
  useEffect(() => {
    async function runAnalysis() {
      if (!wikipediaContent?.content || !gorkpediaContent?.content || analysisResult) return

      setIsAnalyzing(true)
      setAnalysisError(null)

      console.log("[v0] Starting analysis comparison...")

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gorkpediaContent,
            wikipediaContent,
            depth,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Analysis failed")
        }

        if (!result.summary || typeof result.summary.overallScore !== "number") {
          throw new Error("Invalid analysis result structure")
        }

        console.log("[v0] Analysis completed successfully")
        setAnalysisResult(result)
      } catch (error) {
        console.error("[v0] Analysis error:", error)
        setAnalysisError(error instanceof Error ? error.message : "Failed to analyze content. Please try again.")
      } finally {
        setIsAnalyzing(false)
      }
    }

    runAnalysis()
  }, [wikipediaContent, gorkpediaContent, depth, analysisResult])

  const isLoading = wikipediaLoading || gorkpediaLoading
  const hasError = wikipediaError || gorkpediaError

  if (!effectiveGorkpediaUrl) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold text-card-foreground mb-3">Topic or URL Required</h2>
            <p className="text-muted-foreground mb-6">
              Please provide either a topic name or a Gorkpedia article URL to analyze and compare with Wikipedia.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-xl border border-critical/30 bg-critical/5 p-8 text-center">
            <h2 className="text-xl font-semibold text-critical mb-3">Failed to Load Content</h2>
            <p className="text-muted-foreground mb-6">
              {wikipediaError && "Could not fetch Wikipedia content. "}
              {gorkpediaError && "Could not fetch Gorkpedia content. "}
              {topic && `Try checking if "${topic}" exists on both platforms.`}
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Summary Stats */}
        {analysisResult?.summary && (
          <>
            <SummaryStats result={analysisResult} />

            <div className="mb-6 flex justify-end">
              <Button onClick={() => setIsPublishModalOpen(true)} size="lg" className="gap-2">
                <Upload className="h-4 w-4" />
                Publish to DKG
              </Button>
            </div>
          </>
        )}

        {analysisResult?.summary && (
          <div className="mb-6">
            <CommunityNote
              result={analysisResult}
              gorkpediaContent={gorkpediaContent || null}
              wikipediaContent={wikipediaContent || null}
            />
          </div>
        )}

        {/* Analysis Loading State */}
        {isAnalyzing && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-foreground font-medium">Analyzing content...</p>
            <p className="text-sm text-muted-foreground mt-1">
              {depth === "comprehensive" ? "Running deep analysis" : "Running quick scan"}
            </p>
          </div>
        )}

        {/* Analysis Error */}
        {analysisError && (
          <div className="mb-6 rounded-xl border border-critical/30 bg-critical/5 p-6 text-center">
            <p className="text-critical font-medium">{analysisError}</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setAnalysisError(null)
                setAnalysisResult(null)
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Analysis
            </Button>
          </div>
        )}

        {/* Content Viewers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ContentViewer source="gorkpedia" content={gorkpediaContent || null} issues={analysisResult?.issues || []} />
          <ContentViewer source="wikipedia" content={wikipediaContent || null} issues={[]} />
        </div>

        {/* Detailed Results */}
        {analysisResult?.summary && <ComparisonResults result={analysisResult} />}
      </main>

      {analysisResult && gorkpediaContent && wikipediaContent && (
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          analysisResult={analysisResult}
          gorkpediaContent={gorkpediaContent}
          wikipediaContent={wikipediaContent}
          topic={topic || gorkpediaContent.title}
        />
      )}
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
        <Link href="/">
          <Button variant="outline" size="sm" className="h-9 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            New Check
          </Button>
        </Link>
      </div>
    </header>
  )
}
