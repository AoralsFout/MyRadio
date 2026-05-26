import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { errorHandler } from './middleware/error-handler.js'
import { routes } from './routes/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(cors({ origin: config.corsOrigin }))
  app.use(morgan('dev'))
  app.use(express.json())

  app.use('/api', routes)

  if (config.nodeEnv === 'production') {
    const clientDist = path.join(__dirname, '..', '..', 'client', 'dist')
    app.use(express.static(clientDist))
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'))
    })
  }

  app.use(errorHandler)

  return app
}
