import { Router } from 'express'
import authRoutes from './auth.routes'
import measurementRoutes from './measurement.routes'
import userRoutes from './user.routes'

const router = Router()

// API routes
router.use('/auth', authRoutes)
router.use('/measurements', measurementRoutes)
router.use('/users', userRoutes)

// API info
router.get('/', (_req, res) => {
  res.json({
    name: 'Body Measurement Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      measurements: '/api/measurements',
      users: '/api/users',
    },
    documentation: '/api-docs',
  })
})

export default router