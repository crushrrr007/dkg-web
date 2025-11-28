import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { ContentData, AnalysisResult } from "@/lib/analysis-schema"
import {
  segmentContent,
  calculateWeightedScore,
  determineVerdict,
  extractKeyFacts,
  generateComparisonSummary,
} from "@/lib/analysis-utils"

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { gorkpediaContent, wikipediaContent, depth } = body as {
      gorkpediaContent: ContentData
      wikipediaContent: ContentData
      depth: "quick" | "comprehensive"
    }

    console.log("[v0] ========== ANALYSIS STARTED ==========")
    console.log("[v0] Analysis depth:", depth)
    console.log("[v0] Gorkpedia title:", gorkpediaContent?.title)
    console.log("[v0] Wikipedia title:", wikipediaContent?.title)

    if (!gorkpediaContent || !wikipediaContent) {
      return NextResponse.json({ error: "Both gorkpediaContent and wikipediaContent are required" }, { status: 400 })
    }

    const grokipediaSegments = segmentContent(gorkpediaContent.content, gorkpediaContent.sections || [])
    const wikipediaSegments = segmentContent(wikipediaContent.content, wikipediaContent.sections || [])

    console.log("[v0] Content segmentation:", generateComparisonSummary(grokipediaSegments, wikipediaSegments))

    const grokipediaFacts = extractKeyFacts(gorkpediaContent.content)
    const wikipediaFacts = extractKeyFacts(wikipediaContent.content)

    console.log("[v0] Key facts - Grokipedia:", grokipediaFacts.length, "| Wikipedia:", wikipediaFacts.length)

    const contentLimit = depth === "comprehensive" ? 25000 : 12000
    const grokipediaText = gorkpediaContent.content.slice(0, contentLimit)
    const wikipediaText = wikipediaContent.content.slice(0, contentLimit)

    console.log(
      "[v0] Content sent for analysis - Grokipedia:",
      grokipediaText.length,
      "chars | Wikipedia:",
      wikipediaText.length,
      "chars",
    )

    const systemPrompt = `You are an expert fact-checker, bias analyst, and content verification specialist. Your task is to perform a rigorous ${depth === "comprehensive" ? "COMPREHENSIVE" : "QUICK"} analysis of AI-generated content (Grokipedia) against established Wikipedia content as the ground truth.

## ANALYSIS METHODOLOGY

### Stage 1: Claim Extraction
- Identify ALL factual claims in the Grokipedia content
- Focus on: dates, statistics, names, events, relationships, definitions, and causal statements

### Stage 2: Cross-Reference Verification
- For each claim, search Wikipedia content for supporting or contradicting evidence
- Mark claims as: VERIFIED (found in Wikipedia), CONTRADICTED (conflicts with Wikipedia), UNVERIFIED (not found), or PARTIALLY SUPPORTED

### Stage 3: Issue Classification
Categorize each problem found:

1. **FACTUAL_ERROR** (Critical/High): Direct contradiction with Wikipedia facts
   - Wrong dates, incorrect statistics, misattributed quotes, false relationships
   
2. **HALLUCINATION** (Critical): Fabricated information with NO basis in Wikipedia
   - Invented events, non-existent people/places, made-up statistics
   
3. **BIAS** (Medium/High): Non-neutral presentation
   - Loaded language, emotional manipulation, one-sided framing, opinions as facts
   
4. **MISSING_CONTEXT** (Medium): Important Wikipedia info omitted
   - Crucial caveats missing, incomplete explanations, selective omission
   
5. **MISLEADING** (High): Technically true but deceptive
   - Cherry-picked data, false implications, correlation presented as causation
   
6. **OUTDATED** (Low/Medium): Potentially stale information
   - Old statistics when newer exist, superseded theories, resolved controversies

### Stage 4: Severity Assessment
- **CRITICAL**: Fundamentally wrong, could cause significant harm if believed
- **HIGH**: Serious error that significantly misrepresents the topic
- **MEDIUM**: Notable issue that affects understanding
- **LOW**: Minor inaccuracy or stylistic concern

### Stage 5: Scoring Algorithm
Calculate the overall trust score (0-100):
- Start at 100
- Deduct: Critical (-25), High (-15), Medium (-8), Low (-3)
- Minimum score: 0

### KEY FACTS FOR CROSS-REFERENCE
Grokipedia mentions: ${grokipediaFacts.join(", ") || "No specific facts extracted"}
Wikipedia mentions: ${wikipediaFacts.join(", ") || "No specific facts extracted"}

## OUTPUT FORMAT
You MUST respond with ONLY valid JSON (no markdown, no explanation before/after):

{
  "summary": {
    "overallScore": <number 0-100 using scoring algorithm>,
    "totalIssues": <number>,
    "criticalIssues": <number>,
    "highIssues": <number>,
    "mediumIssues": <number>,
    "lowIssues": <number>,
    "verdict": "<reliable|mostly_reliable|questionable|unreliable>",
    "verdictExplanation": "<2-3 sentence detailed explanation of the verdict>"
  },
  "issues": [
    {
      "id": "issue-1",
      "type": "<factual_error|hallucination|bias|missing_context|misleading|outdated>",
      "severity": "<low|medium|high|critical>",
      "title": "<concise issue title>",
      "description": "<detailed explanation of the problem and why it matters>",
      "gorkpediaExcerpt": "<exact quote from Grokipedia showing the issue>",
      "wikipediaEvidence": "<exact quote from Wikipedia that contradicts/provides context>",
      "recommendation": "<specific actionable recommendation>"
    }
  ],
  "topicOverview": "<comprehensive overview of the topic being analyzed>",
  "keyDifferences": ["<specific difference 1>", "<specific difference 2>", ...],
  "agreementAreas": ["<area of agreement 1>", "<area of agreement 2>", ...]
}

## IMPORTANT GUIDELINES
- Be thorough but fair - acknowledge when Grokipedia is accurate
- Provide EXACT quotes, not paraphrases
- Every issue MUST have corresponding evidence from both sources
- ${depth === "comprehensive" ? "Analyze EVERY claim systematically - aim for 10-20 issues if problems exist" : "Focus on the 5-10 most significant issues"}
- Consider the cumulative effect of multiple small issues
- Hallucinations are the most serious - fabricated information undermines all credibility`

    console.log("[v0] Sending request to Google GenAI (models/gemini-flash-latest)...")
    const startTime = Date.now()

    const result = await generateText({
      model: google("models/gemini-flash-latest"),
      system: systemPrompt,
      prompt: `Perform a ${depth} fact-check analysis comparing these two articles:

═══════════════════════════════════════════════════════════════
GROKIPEDIA ARTICLE (AI-Generated - Subject of Analysis)
═══════════════════════════════════════════════════════════════
Title: ${gorkpediaContent.title}
URL: ${gorkpediaContent.url || "N/A"}

${grokipediaText}

═══════════════════════════════════════════════════════════════
WIKIPEDIA ARTICLE (Ground Truth Reference)
═══════════════════════════════════════════════════════════════
Title: ${wikipediaContent.title}
URL: ${wikipediaContent.url || "N/A"}

${wikipediaText}

═══════════════════════════════════════════════════════════════
ANALYSIS TASK
═══════════════════════════════════════════════════════════════
1. Compare the Grokipedia content against Wikipedia systematically
2. Identify ALL factual errors, hallucinations, biases, and misleading statements
3. Provide exact quotes as evidence
4. Calculate the trust score using the weighted algorithm
5. Return ONLY the JSON analysis object`,
      maxTokens: depth === "comprehensive" ? 8000 : 4000,
      temperature: 0.1, // Lower temperature for more consistent, factual analysis
    })

    const analysisTime = Date.now() - startTime
    console.log("[v0] Analysis completed in", analysisTime, "ms")
    console.log("[v0] Response length:", result.text.length, "chars")

    let jsonText = result.text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[v0] Failed to find JSON in response")
      console.error("[v0] Response preview:", result.text.slice(0, 1000))
      throw new Error("Failed to parse analysis result - no JSON found")
    }

    console.log("[v0] Parsing JSON response...")
    let analysisResult: AnalysisResult

    try {
      analysisResult = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      console.error("[v0] Attempted to parse:", jsonMatch[0].slice(0, 500))
      throw new Error("Failed to parse analysis JSON")
    }

    const issues = analysisResult.issues || []
    const criticalCount = issues.filter((i) => i.severity === "critical").length
    const highCount = issues.filter((i) => i.severity === "high").length
    const mediumCount = issues.filter((i) => i.severity === "medium").length
    const lowCount = issues.filter((i) => i.severity === "low").length

    const aiScore = analysisResult.summary?.overallScore ?? 50
    const calculatedScore = calculateWeightedScore(issues)

    // Blend AI score with calculated score (70% AI, 30% calculated) for more reliable results
    const finalScore = Math.round(aiScore * 0.7 + calculatedScore * 0.3)
    const clampedScore = Math.max(0, Math.min(100, finalScore))

    const calculatedVerdict = determineVerdict(clampedScore, criticalCount, highCount)

    console.log("[v0] ========== ANALYSIS RESULTS ==========")
    console.log("[v0] AI Score:", aiScore, "| Calculated Score:", calculatedScore, "| Blended Score:", clampedScore)
    console.log("[v0] Issues found:", issues.length)
    console.log("[v0] - Critical:", criticalCount)
    console.log("[v0] - High:", highCount)
    console.log("[v0] - Medium:", mediumCount)
    console.log("[v0] - Low:", lowCount)
    console.log("[v0] AI Verdict:", analysisResult.summary?.verdict, "| Final Verdict:", calculatedVerdict)

    const finalResult: AnalysisResult = {
      ...analysisResult,
      summary: {
        ...analysisResult.summary,
        overallScore: clampedScore,
        totalIssues: issues.length,
        criticalIssues: criticalCount,
        highIssues: highCount,
        mediumIssues: mediumCount,
        lowIssues: lowCount,
        verdict: calculatedVerdict,
        verdictExplanation:
          analysisResult.summary?.verdictExplanation ||
          `Analysis found ${issues.length} issues with ${criticalCount} critical and ${highCount} high severity problems.`,
      },
    }

    console.log("[v0] Final score:", finalResult.summary.overallScore)
    console.log("[v0] Final verdict:", finalResult.summary.verdict)
    console.log("[v0] ========================================")

    return NextResponse.json(finalResult)
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: `Failed to analyze content: ${errorMessage}` }, { status: 500 })
  }
}
