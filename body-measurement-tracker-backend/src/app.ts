import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import passport from 'passport'
import path from 'path'

import { errorHandler } from './middlewares/error.middleware'
import { rateLimiter } from './middlewares/rateLimiter.middleware'
import routes from './routes'
import { logger } from './utils/logger'
import './config/auth' // Passport config

dotenv.config()

const app = express()

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}))

// Compression
app.use(compression())

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
}

// Rate limiting
app.use('/api', rateLimiter)

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Passport initialization
app.use(passport.initialize())

// API routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Error handling middleware (should be last)
app.use(errorHandler)

export default app