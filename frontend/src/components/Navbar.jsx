export default function Navbar() {
  return (
    <div className="sticky top-0 z-20 w-full bg-white/70 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Adaptive<span className="text-indigo-600">X</span>
        </div>
        <div className="text-sm text-gray-600">AI-Powered Learning</div>
      </div>
    </div>
  )
}
