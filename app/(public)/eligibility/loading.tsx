export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse mx-auto mb-4" />
        <div className="h-4 w-80 bg-white/10 rounded animate-pulse mx-auto mb-10" />
        <div className="bg-white/5 rounded-2xl p-8 animate-pulse">
          <div className="h-6 w-40 bg-white/10 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-white/10 rounded-xl" />
            ))}
          </div>
          <div className="h-12 w-full bg-white/10 rounded-full mt-8" />
        </div>
      </div>
    </div>
  )
}
