import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  musicDir: process.env.MUSIC_DIR || 'F:\\学长音乐精选\\',
  cacheFile: path.join(__dirname, '..', 'data', 'cache.json'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
}
