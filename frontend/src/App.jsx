import { useState } from 'react'
import Navbar from './components/Navbar'
import SubjectPicker from './components/SubjectPicker'
import Quiz from './components/Quiz'
import Analytics from './components/Analytics'

export default function App() {
  const [session, setSession] = useState(null)
  // This history state will now persist across quizzes
  const [history, setHistory] = useState([])

  const start = (payload) => {
    setSession(payload)
    // The line that reset the history has been removed from here.
  }

  const onComplete = (answers) => {
    // This will add the new quiz answers to the existing history
    setHistory(prev => [...prev, ...answers])
    setSession(null)
  }

  // This now correctly calculates accuracy across all quizzes taken
  const lastAccuracy = history.length ? history.filter(h => h.correct).length / history.length : 0.6

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {!session && <SubjectPicker onStart={start} />}
            {session && <Quiz session={session} profile={{ lastAccuracy }} onComplete={onComplete} />}
          </div>
          <div className="space-y-6">
            {/* Analytics will now show the combined history of all quizzes */}
            <Analytics history={history} />
            <div className="glass rounded-2xl p-4 text-sm text-gray-700">
              <div className="font-semibold mb-1">Tips</div>
              • Aim for consistency over perfection.<br />
              • Use hints if stuck, then retry.<br />
              • Watch how difficulty adapts as your accuracy changes.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
