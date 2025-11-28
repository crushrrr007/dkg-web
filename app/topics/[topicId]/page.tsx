import { Suspense } from "react"
import { TopicDetailView } from "@/components/topic-detail-view"
import { LoadingSkeleton } from "@/components/loading-skeleton"

export default function TopicDetailPage({ params }: { params: { topicId: string } }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TopicDetailView topicId={params.topicId} />
    </Suspense>
  )
}
