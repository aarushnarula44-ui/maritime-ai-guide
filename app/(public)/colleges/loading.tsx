export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-56 bg-white/10 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-80 bg-white/10 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-6 w-3/4 bg-white/10 rounded mb-3" />
              <div className="h-4 w-1/2 bg-white/10 rounded mb-2" />
              <div className="h-4 w-full bg-white/10 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-white/10 rounded-full" />
                <div className="h-6 w-20 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
