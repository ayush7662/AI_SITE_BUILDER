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

// ✅ CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
)

// ❌ DO NOT USE: app.options('*', cors())  (causes crash in Express 5)

// Stripe webhook (must be before JSON)
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)

// JSON parser
app.use(express.json({ limit: '50mb' }))

// Auth routes
app.all('/api/auth/*', toNodeHandler(auth))

// Routes
app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)

// Health check
app.get('/', (req: Request, res: Response) => {
  res.send('Server is Live')
})

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})