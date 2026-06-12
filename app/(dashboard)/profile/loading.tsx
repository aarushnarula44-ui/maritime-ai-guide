export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="h-7 w-36 bg-white/10 rounded-lg animate-pulse mb-8" />
        <div className="bg-white/5 rounded-2xl p-6 animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-white/10 rounded mb-2" />
              <div className="h-11 w-full bg-white/10 rounded-xl" />
            </div>
          ))}
          <div className="h-12 w-32 bg-white/10 rounded-full mt-4" />
        </div>
      </div>
    </div>
  )
}
