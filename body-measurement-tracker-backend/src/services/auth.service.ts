import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/database'
import { supabase, supabaseAdmin } from '../config/supabase'
import { AppError } from '../utils/AppError'
import { JwtPayload, User } from '../types'
import { logger } from '../utils/logger'
import crypto from 'crypto'

export class AuthService {
  private static instance: AuthService

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async register(email: string, password: string, name: string): Promise<{ user: Partial<User>; token: string; refreshToken: string }> {
    // Check if user exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new AppError('User already exists with this email', 400)
    }

    // Create user in Supabase Auth (optional - you can use this or keep your own JWT)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      logger.error('Supabase user creation error:', authError)
      // Continue with local user creation even if Supabase fails
    }

    // Hash password for local storage
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: 'local',
        providerId: authData?.user?.id, // Store Supabase user ID if available
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      }
    })

    logger.info(`New user registered: ${email}`)

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user)

    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken)

    return { user, token, refreshToken }
  }

  async login(email: string, password: string): Promise<{ user: Partial<User>; token: string; refreshToken: string }> {
    // Find user in our database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    // Check if user is from OAuth
    if (user.provider !== 'local') {
      throw new AppError(`This account uses ${user.provider} login. Please log in with ${user.provider}.`, 400)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password!)
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401)
    }

    // Optional: Verify with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      logger.warn('Supabase auth warning:', authError.message)
      // Continue with local auth even if Supabase fails
    }

    logger.info(`User logged in: ${email}`)

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user)

    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken)

    // Return user without sensitive data
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }

    return { user: userData, token, refreshToken }
  }

  async socialLogin(provider: string, providerId: string, email: string, name: string, image?: string): Promise<{ user: Partial<User>; token: string; refreshToken: string }> {
    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { providerId, provider }
        ]
      }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          provider,
          providerId,
          emailVerified: true,
        }
      })
      logger.info(`New ${provider} user created: ${email}`)
    }

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user)

    // Save refresh token
    await this.saveRefreshToken(user.id, refreshToken)

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }

    return { user: userData, token, refreshToken }
  }

  generateTokens(user: Partial<User>): { token: string; refreshToken: string } {
    const payload: JwtPayload = {
      id: user.id!,
      email: user.email!,
      name: user.name!,
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET is not defined', 500)
    }

    // Use the same JWT secret as Supabase for compatibility
    const token = jwt.sign(payload, jwtSecret as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as jwt.SignOptions)

    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET
    if (!jwtRefreshSecret) {
      throw new AppError('JWT_REFRESH_SECRET is not defined', 500)
    }

    const refreshToken = jwt.sign(
      { id: user.id },
      jwtRefreshSecret as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as jwt.SignOptions
    )

    return { token, refreshToken }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string }

      // Check if refresh token exists and is not revoked
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.id,
          revoked: false,
          expiresAt: {
            gt: new Date()
          }
        }
      })

      if (!storedToken) {
        throw new AppError('Invalid refresh token', 401)
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        }
      })

      if (!user) {
        throw new AppError('User not found', 401)
      }

      // Generate new tokens
      const tokens = this.generateTokens(user)

      // Revoke old refresh token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }
      })

      // Save new refresh token
      await this.saveRefreshToken(user.id, tokens.refreshToken)

      return tokens
    } catch (error) {
      throw new AppError('Invalid refresh token', 401)
    }
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      }
    })
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
      },
      data: {
        revoked: true,
      }
    })
    
    // Optional: Sign out from Supabase
    await supabase.auth.signOut()
    
    logger.info(`User logged out: ${userId}`)
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      }
    })
    logger.info(`User logged out from all devices: ${userId}`)
  }

  async verifySupabaseToken(token: string): Promise<any> {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) return null
    return user
  }

  // Optional: Sync user from Supabase to local database
  async syncSupabaseUser(supabaseUserId: string): Promise<void> {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId)
    
    if (error || !user) {
      throw new AppError('Supabase user not found', 404)
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: user.email },
          { providerId: user.id, provider: 'supabase' }
        ]
      }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          image: user.user_metadata?.avatar_url,
          provider: 'supabase',
          providerId: user.id,
          emailVerified: user.email_confirmed_at ? true : false,
        }
      })
      logger.info(`Synced Supabase user: ${user.email}`)
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists for security
      return
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save token hash to database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetTokenHash,
        expiresAt: resetTokenExpiry
      }
    })

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`
    await this.sendPasswordResetEmail(email, resetLink)
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token: tokenHash }
    })

    if (!passwordReset || passwordReset.used || passwordReset.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || user.id !== passwordReset.userId) {
      throw new AppError('Invalid reset request', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password and mark token as used
    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true }
      })
    ])
  }

  private async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    // Implement your email sending logic here
    logger.info(`Password reset link sent to ${email}`)
  }
}