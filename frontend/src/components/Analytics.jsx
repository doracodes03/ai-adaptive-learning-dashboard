export default function Analytics({ history }) {
  const attempts = history.length
  const correct = history.filter(h => h.correct).length
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-2">Your Analytics</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border">
          <div className="text-sm text-gray-600">Attempts</div>
          <div className="text-2xl font-bold">{attempts}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border">
          <div className="text-sm text-gray-600">Correct</div>
          <div className="text-2xl font-bold">{correct}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border">
          <div className="text-sm text-gray-600">Accuracy</div>
          <div className="text-2xl font-bold">{accuracy}%</div>
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-3">Content difficulty will adapt as you go.</div>
    </div>
  )
}
