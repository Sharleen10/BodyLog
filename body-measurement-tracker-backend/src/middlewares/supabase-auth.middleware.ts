import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'
import prisma from '../config/database'
import { AppError } from '../utils/AppError'
import { logger } from '../utils/logger'

export const supabaseAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401)
    }

    // Find or create user in local database
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          { providerId: user.id, provider: 'supabase' }
        ]
      }
    })

    if (!dbUser) {
      // Create user in local database
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          image: user.user_metadata?.avatar_url,
          provider: 'supabase',
          providerId: user.id,
          emailVerified: user.email_confirmed_at ? true : false,
        }
      })
      logger.info(`Created local user from Supabase: ${user.email}`)
    }

    // Attach user to request
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
    }

    next()
  } catch (error) {
    next(error)
  }
}