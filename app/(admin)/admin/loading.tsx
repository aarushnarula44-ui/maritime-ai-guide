export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="h-7 w-36 bg-white/10 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-56 bg-white/10 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-3" />
              <div className="h-8 w-20 bg-white/10 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 animate-pulse h-72" />
          <div className="bg-white/5 rounded-xl p-6 animate-pulse h-72" />
        </div>
      </div>
    </div>
  )
}
