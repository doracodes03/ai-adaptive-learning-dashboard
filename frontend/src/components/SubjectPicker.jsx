import { useState } from 'react'

export default function SubjectPicker({ onStart }) {
  const [subject, setSubject] = useState('Mathematics')
  const [topic, setTopic] = useState('Algebra')
  const [difficulty, setDifficulty] = useState('easy')

  return (
    <div className="glass shadow-glow rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">Choose your session</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Subject</span>
          <input className="border rounded-lg p-2" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g., Mathematics" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Topic</span>
          <input className="border rounded-lg p-2" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g., Algebra" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">Difficulty</span>
          <select className="border rounded-lg p-2" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
            <option>easy</option><option>medium</option><option>hard</option>
          </select>
        </label>
      </div>
      <button onClick={() => onStart({subject, topic, difficulty})} className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:shadow-glow">
        Start Practice
      </button>
    </div>
  )
}
