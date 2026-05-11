import express, { Request, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.ts'
import userRouter from './routes/userRoutes.js'
import projectRouter from './routes/projectRoutes.js'
import { stripeWebhook } from './controllers/stripeWebhook.js'

const app = express()
const port = process.env.PORT || 3000

const allowedOrigins = [
  'https://ai-site-builder-zeta.vercel.app',
  'http://localhost:5173'
]

// 🔥 FIXED CORS (SAFE + SIMPLE + WORKING)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
)

// 🔥 IMPORTANT: HANDLE PREFLIGHT
app.options('*', cors())

// 🔥 STRIPE (MUST BE BEFORE JSON)
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)

// 🔥 JSON BODY
app.use(express.json({ limit: '50mb' }))

// 🔥 AUTH ROUTE (KEEP AFTER CORS + OPTIONS)
app.all('/api/auth/*', toNodeHandler(auth))

// ROUTES
app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

// HEALTH CHECK
app.get('/', (req: Request, res: Response) => {
  res.send('Server is Live')
})

app.listen(port, () => {
  console.log(`Server running at ${port}`)
})