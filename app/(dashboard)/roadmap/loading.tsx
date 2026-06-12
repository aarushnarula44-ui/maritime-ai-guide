export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="h-7 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-72 bg-white/10 rounded animate-pulse mb-10" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5 animate-pulse flex gap-4 items-center">
              <div className="h-10 w-10 bg-white/10 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-48 bg-white/10 rounded mb-2" />
                <div className="h-4 w-full bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
