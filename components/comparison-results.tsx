"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IssueCard } from "@/components/issue-card"
import type { AnalysisResult } from "@/lib/analysis-schema"
import { AlertTriangle, CheckCircle, GitCompare, FileText } from "lucide-react"

interface ComparisonResultsProps {
  result: AnalysisResult
}

export function ComparisonResults({ result }: ComparisonResultsProps) {
  const issues = result.issues || []
  const keyDifferences = result.keyDifferences || []
  const agreementAreas = result.agreementAreas || []
  const topicOverview = result.topicOverview || "No overview available."

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg text-card-foreground">Detailed Findings</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="w-full justify-start bg-muted p-1 rounded-lg h-auto flex-wrap">
            <TabsTrigger
              value="issues"
              className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <AlertTriangle className="h-4 w-4" />
              Issues ({issues.length})
            </TabsTrigger>
            <TabsTrigger
              value="differences"
              className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <GitCompare className="h-4 w-4" />
              Differences
            </TabsTrigger>
            <TabsTrigger
              value="agreements"
              className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <CheckCircle className="h-4 w-4" />
              Agreements
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 rounded-md px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="mt-6">
            {issues.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="font-medium text-foreground">No significant issues found</p>
                <p className="text-sm mt-1">The content appears to align with Wikipedia sources.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <IssueCard key={issue.id || `issue-${index}`} issue={issue} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="differences" className="mt-6">
            {keyDifferences.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No significant differences identified.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {keyDifferences.map((diff, index) => (
                  <li key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                    <GitCompare className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                    <span className="text-foreground leading-relaxed">{diff}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="agreements" className="mt-6">
            {agreementAreas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No specific areas of agreement identified.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {agreementAreas.map((agreement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-success/5 border border-success/20"
                  >
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                    <span className="text-foreground leading-relaxed">{agreement}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="p-5 rounded-lg bg-muted/50 border border-border">
              <p className="text-foreground leading-relaxed">{topicOverview}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
