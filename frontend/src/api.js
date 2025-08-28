const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
export async function generateQuestions(payload, idToken) {
  const res = await fetch(`${BASE}/api/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function getFeedback(payload, idToken) {
  const res = await fetch(`${BASE}/api/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify(payload)
  })
  return res.json()
}
