import { Suspense } from "react"
import { ActivityHistory } from "@/components/activity-history"
import { LoadingSkeleton } from "@/components/loading-skeleton"

export const metadata = {
  title: "Activity - compareDKG",
  description: "View publishing history and activity log",
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ActivityHistory />
    </Suspense>
  )
}
