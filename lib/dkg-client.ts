import type { CommunityNote, DKGPublishResponse } from "./dkg-schema"

const DKG_BASE_URL = process.env.DKG_BASE_URL || "http://localhost:9200"
const DKG_API_KEY = process.env.DKG_API_KEY

export async function publishToDKG(communityNote: CommunityNote): Promise<DKGPublishResponse> {
  try {
    console.log("[v0] ========== DKG PUBLISH START ==========")
    console.log("[v0] Publishing to DKG...")
    console.log("[v0] DKG_BASE_URL:", DKG_BASE_URL)
    console.log("[v0] Community Note Topic:", communityNote.claimReviewed)

    // Transform Community Note to the format expected by DKG API
    const payload = {
      content: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Article",
        name: `Community Note: ${communityNote.claimReviewed}`,
        description: communityNote.reviewRating.ratingExplanation,
        author: communityNote.author.name,
        datePublished: communityNote.datePublished,
        // Include full community note data
        claimReview: communityNote,
      }),
      privacy: "public",
    }

    console.log("[v0] Payload structure:")
    console.log("[v0]   - privacy:", payload.privacy)
    console.log("[v0]   - content (parsed):", JSON.parse(payload.content))
    console.log("[v0] Full request URL:", `${DKG_BASE_URL}/publishnote/create`)

    const response = await fetch(`${DKG_BASE_URL}/publishnote/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(DKG_API_KEY && { Authorization: `Bearer ${DKG_API_KEY}` }),
      },
      body: JSON.stringify(payload),
    })

    console.log("[v0] Response status:", response.status, response.statusText)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] DKG API error response:", errorText)
      throw new Error(`DKG API error (${response.status}): ${errorText}`)
    }

    const result = await response.json()

    console.log("[v0] DKG API success response:", JSON.stringify(result, null, 2))

    // Assuming the DKG API returns { ual: string, ... }
    const ual = result.ual || result.UAL || result.id

    if (!ual) {
      console.error("[v0] UAL not found in response. Full response:", result)
      throw new Error("DKG API did not return a UAL")
    }

    console.log("[v0] ✓ Successfully published to DKG")
    console.log("[v0] ✓ UAL:", ual)
    console.log("[v0] ========== DKG PUBLISH END ==========")

    return {
      success: true,
      ual,
      transactionHash: result.transactionHash || result.txHash || undefined,
      explorerUrl: result.explorerUrl || `${DKG_BASE_URL}/explore?ual=${encodeURIComponent(ual)}`,
    }
  } catch (error) {
    console.error("[v0] ========== DKG PUBLISH ERROR ==========")
    console.error("[v0] Error type:", error?.constructor?.name)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] ==========================================")

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish to DKG",
    }
  }
}

export async function fetchFromDKG(ual: string): Promise<CommunityNote | null> {
  try {
    console.log("[v0] Fetching from DKG:", ual)

    // Mock implementation for demo purposes
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would fetch from the actual DKG
    return null
  } catch (error) {
    console.error("[v0] DKG fetch error:", error)
    return null
  }
}

export async function checkDKGHealth(): Promise<{ status: string; endpoint: string }> {
  try {
    // Mock health check
    return {
      status: "operational",
      endpoint: DKG_BASE_URL,
    }
  } catch (error) {
    return {
      status: "error",
      endpoint: DKG_BASE_URL,
    }
  }
}
