export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="h-7 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-64 bg-white/10 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-3" />
              <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-2xl p-6 animate-pulse h-64" />
          <div className="bg-white/5 rounded-2xl p-6 animate-pulse h-64" />
        </div>
      </div>
    </div>
  )
}
