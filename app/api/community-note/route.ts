import { type NextRequest, NextResponse } from "next/server"
import { publishToDKG } from "@/lib/dkg-client"
import type { AnalysisResult, ContentData } from "@/lib/analysis-schema"
import type { CommunityNote } from "@/lib/dkg-schema"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ========== COMMUNITY NOTE API START ==========")

    const body = await request.json()
    const { analysisResult, gorkpediaContent, wikipediaContent, topic } = body as {
      analysisResult: AnalysisResult
      gorkpediaContent: ContentData
      wikipediaContent: ContentData
      topic: string
    }

    console.log("[v0] Request received for topic:", topic)
    console.log("[v0] Analysis issues count:", analysisResult.issues.length)
    console.log("[v0] Overall score:", analysisResult.summary.overallScore)
    console.log("[v0] Verdict:", analysisResult.summary.verdict)

    // Build segment claims from analysis result
    const segments = analysisResult.issues.slice(0, 10).map((issue, index) => ({
      segment: `segment-${index + 1}`,
      text: issue.gorkpediaExcerpt,
      classification: mapIssueTypeToClassification(issue.type),
      similarityScore: 0.75 - (issue.severity === "critical" ? 0.4 : issue.severity === "high" ? 0.3 : 0.1),
      hallucinationProbability: issue.type === "hallucination" ? 0.85 : issue.type === "factual_error" ? 0.65 : 0.3,
      evidence: [
        {
          url: wikipediaContent.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaContent.title)}`,
          snippet: issue.wikipediaEvidence,
          confidence: 0.9,
          sourceOffset: 0,
        },
      ],
      explanation: issue.description,
    }))

    console.log("[v0] Created", segments.length, "segments for Community Note")

    const communityNote: CommunityNote = {
      "@context": "https://schema.org",
      "@type": "ClaimReview",
      datePublished: new Date().toISOString(),
      claimReviewed: topic,
      reviewRating: {
        "@type": "Rating",
        ratingValue: analysisResult.summary.overallScore,
        bestRating: 100,
        worstRating: 0,
        ratingExplanation: analysisResult.summary.verdictExplanation,
      },
      itemReviewed: {
        "@type": "CreativeWork",
        name: gorkpediaContent.title,
        author: "Grokipedia (Google AI)",
        datePublished: gorkpediaContent.fetchedAt,
        url: gorkpediaContent.url,
      },
      author: {
        "@type": "Organization",
        name: "compareDKG Verification System",
      },
      segments,
      trustScore: analysisResult.summary.overallScore,
      verdict: analysisResult.summary.verdict,
      methodology: "Semantic similarity analysis + hallucination detection + bias classification using Google GenAI LLM",
    }

    console.log("[v0] Community Note structure created successfully")
    console.log("[v0] Calling publishToDKG...")

    const publishResult = await publishToDKG(communityNote)

    console.log("[v0] Publish result success:", publishResult.success)

    if (!publishResult.success) {
      console.error("[v0] Publish failed with error:", publishResult.error)
      throw new Error(publishResult.error || "Failed to publish to DKG")
    }

    console.log("[v0] ✓ Successfully published with UAL:", publishResult.ual)

    // Store in local history
    await storeInHistory({
      ual: publishResult.ual!,
      topic,
      trustScore: analysisResult.summary.overallScore,
      verdict: analysisResult.summary.verdict,
      timestamp: new Date().toISOString(),
      communityNote,
    })

    console.log("[v0] Returning success response to client")
    console.log("[v0] ========== COMMUNITY NOTE API END ==========")

    return NextResponse.json({
      success: true,
      ual: publishResult.ual,
      explorerUrl: publishResult.explorerUrl,
      communityNote,
    })
  } catch (error) {
    console.error("[v0] ========== COMMUNITY NOTE API ERROR ==========")
    console.error("[v0] Error caught in POST handler")
    console.error("[v0] Error type:", error?.constructor?.name)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Error message:", errorMessage)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] ==============================================")

    return NextResponse.json({ error: `Failed to create Community Note: ${errorMessage}` }, { status: 500 })
  }
}

function mapIssueTypeToClassification(type: string): "aligned" | "missing_context" | "conflict" | "unsupported" {
  switch (type) {
    case "factual_error":
    case "hallucination":
      return "conflict"
    case "missing_context":
      return "missing_context"
    case "misleading":
    case "outdated":
      return "unsupported"
    default:
      return "aligned"
  }
}

async function storeInHistory(entry: {
  ual: string
  topic: string
  trustScore: number
  verdict: string
  timestamp: string
  communityNote: CommunityNote
}) {
  console.log("[v0] ========== STORING IN HISTORY ==========")
  console.log("[v0] Published Community Note:")
  console.log("[v0]   - UAL:", entry.ual)
  console.log("[v0]   - Topic:", entry.topic)
  console.log("[v0]   - Trust Score:", entry.trustScore)
  console.log("[v0]   - Verdict:", entry.verdict)
  console.log("[v0]   - Timestamp:", entry.timestamp)
  console.log("[v0] ===========================================")
  // In production, this would store to a database
  // For now, we'll rely on localStorage on the client side
}
