import { useEffect, useState } from 'react'
import { generateQuestions, getFeedback } from '../api'

export default function Quiz({ session, idToken, onComplete, profile }) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [answers, setAnswers] = useState([])
  const current = items[idx]

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const res = await generateQuestions({
        ...session,
        numQuestions: 5,
        profile
      }, idToken)
      if (mounted) {
        setItems(res.items || [])
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [session.subject, session.topic, session.difficulty])

  if (loading) return <div className="p-6">Generating questions...</div>
  if (!items.length) return <div className="p-6">No questions returned.</div>

  const submit = async (choice) => {
  setSelected(choice);
  const res = await getFeedback({
    question: current,
    userAnswer: choice,
    context: { subject: session.subject, topic: session.topic }
  }, idToken);

  console.log('Backend Response:', res); // <-- ADD THIS LINE

  setFeedback(res);
  setAnswers(prev => [...prev, { correct: res.correctness }]);
 };

  const next = () => {
    setFeedback(null); setSelected(null)
    if (idx + 1 < items.length) setIdx(idx + 1)
    else onComplete(answers)
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="text-sm text-gray-600 mb-2">Difficulty tuned by accuracy/time</div>
      <h3 className="text-lg font-semibold mb-4">{current.stem}</h3>
      <div className="grid gap-2">
        {current.options?.map((opt, i) => {
          const letter = String.fromCharCode(65 + i)
          const chosen = selected === letter
          return (
            <button key={i} onClick={() => submit(letter)} disabled={!!selected}
              className={
                "text-left border rounded-xl p-3 hover:shadow-glow " +
                (chosen ? "bg-indigo-50 border-indigo-300" : "bg-white")
              }>
              <span className="font-semibold mr-2">{letter}.</span>{opt}
            </button>
          )
        })}
      </div>

      {feedback && (
        <div className={"mt-4 p-3 rounded-xl " + (feedback.correctness ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200")}>
          <div className="font-medium">{feedback.message}</div>
          <div className="text-sm text-gray-700 mt-1">{feedback.nextHint}</div>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <div className="text-sm text-gray-600">Q {idx+1} / {items.length}</div>
        {selected && <button onClick={next} className="px-4 py-2 rounded-xl bg-purple-600 text-white">Next</button>}
      </div>
    </div>
  )
}
