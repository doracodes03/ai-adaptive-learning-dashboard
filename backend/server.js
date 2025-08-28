import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import admin from 'firebase-admin'
// Replace the old Google client import
import { GoogleGenerativeAI } from '@google/generative-ai'

// ----------------- Schemas -----------------
const FeedbackSchema = z.object({
  question: z.object({
    stem: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    explanation: z.string().optional(),
    hint: z.string().optional()
  }),
  userAnswer: z.string(),
  context: z.any().optional()
})

const GenerateSchema = z.object({
  subject: z.string().min(2),
  topic: z.string().min(2),
  difficulty: z.enum(['easy','medium','hard']).default('easy'),
  numQuestions: z.number().int().min(1).max(10).default(5),
  profile: z.object({
    lastAccuracy: z.number().min(0).max(1).optional(),
    avgTimeSecs: z.number().min(0).optional(),
  }).optional()
})

// ----------------- Server Init -----------------
console.log("🚀 Starting server.js...")
console.log("🔑 Loaded ENV Keys:", {
  PORT: process.env.PORT,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? "✅ Present" : "❌ Missing",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "❌ Missing"
})

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8080

// ----------------- Google Generative API -----------------
// New client initialization
let genAI = null
if (process.env.GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
} else {
  console.warn("⚠️ GOOGLE_API_KEY is missing. AI features will be disabled.")
}

// ----------------- Firebase Admin -----------------
let db;
let adminReady = false
try {
  if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log("⚡ Initializing Firebase Admin...")
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
    db = admin.firestore();
    adminReady = true
    console.log("✅ Firebase Admin initialized")
  }
} catch (e) {
  console.warn('❌ Firebase Admin init failed:', e.message)
}

// ----------------- Auth Middleware -----------------
const requireAuth = async (req, res, next) => {
  if (!adminReady) return next()
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' })

  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.user = decoded
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ----------------- Routes -----------------

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Generate questions
app.post("/api/generate-questions", async (req, res) => {
  try {
    const parsed = GenerateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

    const { subject, topic, difficulty, numQuestions, profile } = parsed.data

    let level = difficulty
    if (profile?.lastAccuracy !== undefined) {
      if (profile.lastAccuracy > 0.85) level = 'hard'
      else if (profile.lastAccuracy < 0.5) level = 'easy'
      else level = 'medium'
    }

    // Mock fallback (this part remains the same)
    if (!genAI) {
      const mock = Array.from({ length: numQuestions }, (_, i) => ({
        stem: `Mock ${subject} question #${i + 1} on ${topic}?`,
        options: ["A", "B", "C", "D"],
        answer: "A",
        explanation: "This is mock data",
        hint: "Think about the basics"
      }))
      return res.json({ items: mock, usedModel: "mock", level })
    }

    // Updated Google API call
    // 1. Get a modern model (Gemini is much better for JSON)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 2. Create the prompt
    const prompt = `Generate ${numQuestions} multiple-choice questions for the subject "${subject}" on the topic "${topic}" at a ${level} difficulty.
Return ONLY a single, valid JSON object that matches this exact structure:
{ "items": [{ "stem": "...", "options": ["...","...","...","..."], "answer": "A", "explanation": "...", "hint": "..." }] }
⚠️ Important: The "answer" field MUST be only a single uppercase letter: "A", "B", "C", or "D".`

    // 3. Call the API with the new method
    const result = await model.generateContent(prompt)
    const response = result.response
    const jsonText = response.text()

    let items = []
    try {
      // More robustly find and parse the JSON object within the response text
      const startIndex = jsonText.indexOf('{');
      const endIndex = jsonText.lastIndexOf('}');
      if (startIndex > -1 && endIndex > -1 && endIndex > startIndex) {
        const jsonSubstring = jsonText.substring(startIndex, endIndex + 1);
        items = JSON.parse(jsonSubstring)?.items || [];
      } else {
         console.error("❌ Could not find a valid JSON object in the response text.");
      }
    } catch (err) {
      console.error("❌ JSON parse failed!", { error: err.message, text: jsonText })
    }

    res.json({ items, usedModel: "gemini-1.5-flash-latest", level })

  } catch (err) {
    console.error("🔥 Server error:", err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
})

// Feedback endpoint

const normalize = (val) => {
  if (!val) return ''
  return val.toString().trim().toUpperCase().charAt(0) // always "A","B","C","D"
}

app.post('/api/feedback', requireAuth, async (req, res) => {
  const { question, userAnswer } = req.body;

  // 1. Normalize both the user's answer and the AI's answer
  const userLetter = normalize(userAnswer);
  const correctLetterFromAI = normalize(question.answer);

  // 2. Start by assuming the AI gave us a letter ("A", "B", "C", "D")
  let finalCorrect = correctLetterFromAI;

  // 3. FALLBACK: If the AI gave the full text answer, find the matching letter
  if (!["A", "B", "C", "D"].includes(correctLetterFromAI) && question.options) {
    const idx = question.options.findIndex(
      (opt) => opt.trim().toUpperCase() === question.answer.trim().toUpperCase()
    );
    if (idx !== -1) {
      finalCorrect = String.fromCharCode(65 + idx); // Convert index (0, 1, 2) to letter ("A", "B", "C")
    }
  }

  // 4. NOW, calculate correctness using the final, verified correct letter
  const correctness = (userLetter === finalCorrect);

  // 5. Return the result
  return res.json({
    correctness, // This is now calculated correctly
    message: correctness ? "Correct! Great job." : "Not quite. Check the explanation.",
    nextHint: correctness ? "Try a harder one." : "Review the key concept.",
  });
});




// app.post('/api/feedback', requireAuth, async (req, res) => {
//   const parsed = FeedbackSchema.safeParse(req.body)
//   if (!parsed.success) return res.status(400).json({ error: parsed.error.issues })

//   const { question, userAnswer } = parsed.data
//   // Correctly compare only the first character of the user's answer
//   const correctness = (userAnswer.trim().charAt(0).toUpperCase() === question.answer.trim().toUpperCase())

//   // Save feedback to Firestore
//   if (adminReady) {
//     const feedbackRef = db.collection('users').doc(req.user.uid).collection('feedback');
//     await feedbackRef.add({
//       correctness,
//       timestamp: admin.firestore.FieldValue.serverTimestamp(),
//       question: question.stem,
//       userAnswer,
//       correctAnswer: question.answer
//     });
//   }


//   res.json({
//     correctness,
//     message: correctness ? "Correct! Great job." : "Not quite. Check the explanation and hint.",
//     nextHint: correctness ? "Try a harder one." : "Review the key concept and attempt an easier one."
//   })
// })

// Analytics endpoint
app.get('/api/analytics', requireAuth, async (req, res) => {
  if (!adminReady) {
    return res.status(500).json({ error: "Analytics not available" });
  }

  try {
    const feedbackRef = db.collection('users').doc(req.user.uid).collection('feedback');
    const snapshot = await feedbackRef.get();

    let attempts = 0;
    let correct = 0;

    snapshot.forEach(doc => {
      attempts++;
      if (doc.data().correctness) {
        correct++;
      }
    });

    const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;

    res.json({
      attempts,
      correct,
      accuracy: parseFloat(accuracy.toFixed(2))
    });

  } catch (error) {
    console.error("🔥 Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});


// ----------------- Start server -----------------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`)
})
