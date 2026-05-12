import express, { Request, Response } from 'express'
import 'dotenv/config'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'

import { auth } from './lib/auth.js'
import userRouter from './routes/userRoutes.js'

import projectRouter from './routes/projectRoutes.js'
import { stripeWebhook } from './controllers/stripeWebhook.js'

const app = express()
const port = process.env.PORT || 3000


const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
     
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
  })
)



app.use('/api/auth', (req, res) => {
  return toNodeHandler(auth)(req, res)
})

// Stripe webhook
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)

// JSON parser
app.use(express.json({ limit: '50mb' }))

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