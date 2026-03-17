import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'
import { supabaseAdmin } from './supabase'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  errorFormat: 'pretty',
})

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect()
    logger.info('✅ Database connected successfully via Prisma')
    
    // Test Supabase connection
    const { data, error } = await supabaseAdmin.auth.getSession()
    if (error) {
      logger.warn('⚠️ Supabase connection warning:', error.message)
    } else {
      logger.info('✅ Supabase client initialized successfully')
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

export const disconnectDB = async (): Promise<void> {
  try {
    await prisma.$disconnect()
    logger.info('Database disconnected')
  } catch (error) {
    logger.error('Error disconnecting from database:', error)
  }
}

export default prisma