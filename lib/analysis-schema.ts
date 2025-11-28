import { z } from "zod"

export const severitySchema = z.enum(["low", "medium", "high", "critical"])

export const issueTypeSchema = z.enum([
  "factual_error",
  "hallucination",
  "bias",
  "missing_context",
  "misleading",
  "outdated",
])

export const issueSchema = z.object({
  id: z.string(),
  type: issueTypeSchema,
  severity: severitySchema,
  title: z.string(),
  description: z.string(),
  gorkpediaExcerpt: z.string(),
  wikipediaEvidence: z.string(),
  recommendation: z.string(),
})

export const analysisResultSchema = z.object({
  summary: z.object({
    overallScore: z.number().min(0).max(100),
    totalIssues: z.number(),
    criticalIssues: z.number(),
    highIssues: z.number(),
    mediumIssues: z.number(),
    lowIssues: z.number(),
    verdict: z.enum(["reliable", "mostly_reliable", "questionable", "unreliable"]),
    verdictExplanation: z.string(),
  }),
  issues: z.array(issueSchema),
  topicOverview: z.string(),
  keyDifferences: z.array(z.string()),
  agreementAreas: z.array(z.string()),
})

export type Severity = z.infer<typeof severitySchema>
export type IssueType = z.infer<typeof issueTypeSchema>
export type Issue = z.infer<typeof issueSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>

export const contentSchema = z.object({
  title: z.string(),
  content: z.string(),
  sections: z.array(
    z.object({
      heading: z.string(),
      content: z.string(),
    }),
  ),
  url: z.string().optional(),
  fetchedAt: z.string(),
})

export type ContentData = z.infer<typeof contentSchema>
