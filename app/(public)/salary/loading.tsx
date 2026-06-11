import { Skeleton } from '@/components/ui/LoadingSkeleton'

export default function SalaryLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-gradient-to-br from-primary via-primary-light to-[#0D2444] h-72" />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
