import { z } from "zod"

// DKG Community Note Schema
export const segmentClaimSchema = z.object({
  segment: z.string(),
  text: z.string(),
  classification: z.enum(["aligned", "missing_context", "conflict", "unsupported"]),
  similarityScore: z.number().min(0).max(1),
  hallucinationProbability: z.number().min(0).max(1),
  evidence: z.array(
    z.object({
      url: z.string(),
      snippet: z.string(),
      confidence: z.number().min(0).max(1),
      sourceOffset: z.number().optional(),
    }),
  ),
  explanation: z.string(),
})

export const communityNoteSchema = z.object({
  "@context": z.literal("https://schema.org"),
  "@type": z.literal("ClaimReview"),
  datePublished: z.string(),
  url: z.string().optional(),
  claimReviewed: z.string(),
  reviewRating: z.object({
    "@type": z.literal("Rating"),
    ratingValue: z.number().min(0).max(100),
    bestRating: z.number(),
    worstRating: z.number(),
    ratingExplanation: z.string(),
  }),
  itemReviewed: z.object({
    "@type": z.literal("CreativeWork"),
    name: z.string(),
    author: z.string(),
    datePublished: z.string(),
    url: z.string().optional(),
  }),
  author: z.object({
    "@type": z.literal("Organization"),
    name: z.string(),
  }),
  segments: z.array(segmentClaimSchema),
  trustScore: z.number().min(0).max(100),
  verdict: z.enum(["reliable", "mostly_reliable", "questionable", "unreliable"]),
  methodology: z.string(),
})

export const dkgPublishResponseSchema = z.object({
  success: z.boolean(),
  ual: z.string().optional(),
  transactionHash: z.string().optional(),
  explorerUrl: z.string().optional(),
  error: z.string().optional(),
})

export type SegmentClaim = z.infer<typeof segmentClaimSchema>
export type CommunityNote = z.infer<typeof communityNoteSchema>
export type DKGPublishResponse = z.infer<typeof dkgPublishResponseSchema>
