import { Suspense } from "react"
import { ComparisonDashboard } from "@/components/comparison-dashboard"
import { LoadingSkeleton } from "@/components/loading-skeleton"

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ComparisonDashboard />
    </Suspense>
  )
}
