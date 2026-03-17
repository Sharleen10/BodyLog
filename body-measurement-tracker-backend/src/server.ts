import app from './app'
import { connectDB, disconnectDB } from './config/database'
import { logger } from './utils/logger'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, async () => {
  await connectDB()
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
  logger.info(`📝 API available at http://localhost:${PORT}/api`)
  logger.info(`🔍 Health check at http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  server.close(async () => {
    logger.info('HTTP server closed')
    await disconnectDB()
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  server.close(async () => {
    logger.info('HTTP server closed')
    await disconnectDB()
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export default server