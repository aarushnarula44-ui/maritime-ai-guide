import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function CETLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444] h-60" />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
