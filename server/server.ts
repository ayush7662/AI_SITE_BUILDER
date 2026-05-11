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


const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    } else {
      return callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))


app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)


app.use(express.json({ limit: '50mb' }))

app.all('/api/auth/*', toNodeHandler(auth))


app.get('/', (req: Request, res: Response) => {
  res.send('Server is Live')
})


app.use('/api/user', userRouter)
app.use('/api/project', projectRouter)


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})