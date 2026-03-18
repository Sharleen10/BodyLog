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
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new AppError('User already exists with this email', 400)
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      logger.error('Supabase user creation error:', authError)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: 'local',
        providerId: authData?.user?.id,
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

    const { token, refreshToken } = this.generateTokens(user)
    await this.saveRefreshToken(user.id, refreshToken)

    return { user, token, refreshToken }
  }

  async login(email: string, password: string): Promise<{ user: Partial<User>; token: string; refreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    if (user.provider !== 'local') {
      throw new AppError(`This account uses ${user.provider} login. Please log in with ${user.provider}.`, 400)
    }

    const isValidPassword = await bcrypt.compare(password, user.password!)
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401)
    }

    // Optional: Verify with Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      logger.warn('Supabase auth warning:', authError.message)
    }

    logger.info(`User logged in: ${email}`)

    const { token, refreshToken } = this.generateTokens(user)
    await this.saveRefreshToken(user.id, refreshToken)

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }

    return { user: userData, token, refreshToken }
  }

  async socialLogin(provider: string, providerId: string, email: string, name: string, image?: string): Promise<{ user: Partial<User>; token: string; refreshToken: string }> {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { providerId, provider }
        ]
      }
    })

    if (!user) {
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

    const { token, refreshToken } = this.generateTokens(user)
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
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string }

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

      const tokens = this.generateTokens(user)

      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }
      })

      await this.saveRefreshToken(user.id, tokens.refreshToken)

      return tokens
    } catch (error) {
      throw new AppError('Invalid refresh token', 401)
    }
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

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
      return
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetTokenHash,
        expiresAt: resetTokenExpiry
      }
    })

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

    const hashedPassword = await bcrypt.hash(newPassword, 10)

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

  private async sendPasswordResetEmail(email: string, _resetLink: string): Promise<void> {
    // Implement your email sending logic here
    logger.info(`Password reset link sent to ${email}`)
  }
}