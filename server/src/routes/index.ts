import { Router } from 'express'
import { createSongsRouter } from './songs.routes.js'
import { createStreamRouter } from './stream.routes.js'

const router = Router()

router.get('/status', (_req, res) => {
  const songs = _req.app.locals.songs
  res.json({
    status: 'ok',
    songCount: songs?.size ?? 0,
    musicDir: process.env.MUSIC_DIR || '',
  })
})

router.use('/songs', createSongsRouter())
router.use('/stream', createStreamRouter())

export { router as routes }
