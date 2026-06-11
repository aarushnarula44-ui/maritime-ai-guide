export default function Loading() {
  return (
    <div className="min-h-screen bg-surface animate-fade-in">
      {/* Skeleton navbar */}
      <div className="h-16 bg-white border-b border-border flex items-center px-6 gap-6">
        <div className="skeleton h-6 w-40 rounded-md" />
        <div className="flex-1" />
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>

      {/* Skeleton hero */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <div className="space-y-4 max-w-xl">
          <div className="skeleton h-12 w-3/4 rounded-lg" />
          <div className="skeleton h-8 w-full rounded-lg" />
          <div className="skeleton h-8 w-2/3 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-border space-y-3">
              <div className="skeleton h-5 w-2/3 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
