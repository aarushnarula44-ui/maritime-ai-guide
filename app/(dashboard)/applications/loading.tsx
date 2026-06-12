export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="h-7 w-44 bg-white/10 rounded-lg animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-5 w-40 bg-white/10 rounded" />
                <div className="h-5 w-20 bg-white/10 rounded-full" />
              </div>
              <div className="h-4 w-56 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
