// Utility functions for improved content analysis

export interface ContentSegment {
  id: string
  heading: string
  content: string
  claims: string[]
}

export interface ClaimComparison {
  grokipediaClaim: string
  wikipediaEvidence: string | null
  matchType: "supported" | "contradicted" | "unverified" | "partial"
  confidence: number
}

/**
 * Extracts key claims from text content
 */
export function extractClaims(content: string): string[] {
  // Split by sentences and filter meaningful claims
  const sentences = content
    .replace(/([.!?])\s+/g, "$1|SPLIT|")
    .split("|SPLIT|")
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 500)

  // Filter out non-factual sentences (questions, imperatives, etc.)
  return sentences.filter((s) => {
    const lowerS = s.toLowerCase()
    // Keep factual statements
    return (
      !lowerS.startsWith("what ") &&
      !lowerS.startsWith("how ") &&
      !lowerS.startsWith("why ") &&
      !lowerS.startsWith("please ") &&
      !lowerS.endsWith("?") &&
      // Must contain some substance
      s.split(" ").length >= 5
    )
  })
}

/**
 * Segments content into logical sections
 */
export function segmentContent(content: string, sections: { heading: string; content: string }[]): ContentSegment[] {
  if (sections && sections.length > 0) {
    return sections.map((section, index) => ({
      id: `segment-${index}`,
      heading: section.heading || "Introduction",
      content: section.content,
      claims: extractClaims(section.content),
    }))
  }

  // Fallback: split by paragraphs
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 50)
  return paragraphs.map((para, index) => ({
    id: `segment-${index}`,
    heading: index === 0 ? "Introduction" : `Section ${index}`,
    content: para,
    claims: extractClaims(para),
  }))
}

/**
 * Calculates text similarity using word overlap (Jaccard-like)
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(
    text1
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )
  const words2 = new Set(
    text2
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  )

  const intersection = new Set([...words1].filter((x) => words2.has(x)))
  const union = new Set([...words1, ...words2])

  return union.size > 0 ? intersection.size / union.size : 0
}

/**
 * Finds the most relevant Wikipedia segment for a Grokipedia claim
 */
export function findRelevantEvidence(
  claim: string,
  wikipediaSegments: ContentSegment[],
): { segment: ContentSegment | null; similarity: number } {
  let bestMatch: ContentSegment | null = null
  let bestSimilarity = 0

  for (const segment of wikipediaSegments) {
    const similarity = calculateTextSimilarity(claim, segment.content)
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity
      bestMatch = segment
    }
  }

  return { segment: bestMatch, similarity: bestSimilarity }
}

/**
 * Calculates weighted score based on issue distribution
 * Reduced penalties significantly for more reasonable scores
 */
export function calculateWeightedScore(issues: { severity: string }[]): number {
  if (issues.length === 0) return 100

  // Much lighter penalties - an article with 10 issues should still score ~60-70
  const weights = {
    critical: 8,
    high: 5,
    medium: 2,
    low: 1,
  }

  const totalPenalty = issues.reduce((sum, issue) => {
    return sum + (weights[issue.severity as keyof typeof weights] || 2)
  }, 0)

  // Apply diminishing returns for many issues (log scale adjustment)
  const adjustedPenalty = totalPenalty > 20 ? 20 + Math.log2(totalPenalty - 19) * 10 : totalPenalty

  return Math.max(0, Math.round(100 - adjustedPenalty))
}

/**
 * Determines verdict based on score and issue distribution
 * More lenient thresholds for realistic verdicts
 */
export function determineVerdict(
  score: number,
  criticalCount: number,
  highCount: number,
): "reliable" | "mostly_reliable" | "questionable" | "unreliable" {
  // Only unreliable if score is very low OR many critical issues
  if (criticalCount >= 5 || score < 20) return "unreliable"
  if (criticalCount >= 3 || highCount >= 5 || score < 40) return "questionable"
  if (criticalCount >= 1 || highCount >= 2 || score < 70) return "mostly_reliable"
  return "reliable"
}

/**
 * Extracts key entities and facts from text
 */
export function extractKeyFacts(content: string): string[] {
  const facts: string[] = []

  // Extract dates
  const datePattern =
    /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})\b/gi
  const dates = content.match(datePattern) || []
  facts.push(...dates.slice(0, 10))

  // Extract numbers with context
  const numberPattern =
    /\b(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:percent|%|million|billion|trillion|thousand|km|miles|meters|feet|years|months|days)\b/gi
  const numbers = content.match(numberPattern) || []
  facts.push(...numbers.slice(0, 10))

  return [...new Set(facts)]
}

/**
 * Generates a comparison summary for logging
 */
export function generateComparisonSummary(
  grokipediaSegments: ContentSegment[],
  wikipediaSegments: ContentSegment[],
): string {
  const grokipediaClaims = grokipediaSegments.reduce((sum, s) => sum + s.claims.length, 0)
  const wikipediaClaims = wikipediaSegments.reduce((sum, s) => sum + s.claims.length, 0)

  return `Grokipedia: ${grokipediaSegments.length} segments, ${grokipediaClaims} claims | Wikipedia: ${wikipediaSegments.length} segments, ${wikipediaClaims} claims`
}
