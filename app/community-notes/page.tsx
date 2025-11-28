import { Suspense } from "react"
import { CommunityNotesList } from "@/components/community-notes-list"
import { LoadingSkeleton } from "@/components/loading-skeleton"

export const metadata = {
  title: "Community Notes - compareDKG",
  description: "Browse published Community Notes with search and filtering",
}

export default function CommunityNotesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CommunityNotesList />
    </Suspense>
  )
}
