import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'
import { LoginRequestBody, RegisterRequestBody, AuthRequest } from '../types'
import passport from 'passport'
import { sendResponse } from '../utils/helpers'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { constants } from '../config/constants'
import { prisma } from '../config/prisma'

const authService = AuthService.getInstance()

export const register = catchAsync(async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  _next: NextFunction
) => {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    throw new AppError('Please provide email, password and name', constants.HTTP_STATUS.BAD_REQUEST)
  }

  const result = await authService.register(email, password, name)

  sendResponse(res, result, 'User registered successfully', constants.HTTP_STATUS.CREATED)
})

export const login = catchAsync(async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  _next: NextFunction
) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new AppError('Please provide email and password', constants.HTTP_STATUS.BAD_REQUEST)
  }

  const result = await authService.login(email, password)

  sendResponse(res, result, 'Logged in successfully')
})

export const refreshToken = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new AppError('Refresh token is required', constants.HTTP_STATUS.BAD_REQUEST)
  }

  const tokens = await authService.refreshAccessToken(refreshToken)

  sendResponse(res, tokens, 'Token refreshed successfully')
})

export const logout = catchAsync(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const { refreshToken } = req.body
  const userId = req.user!.id

  await authService.logout(userId, refreshToken)

  sendResponse(res, null, 'Logged out successfully')
})

export const logoutAll = catchAsync(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.id

  await authService.logoutAll(userId)

  sendResponse(res, null, 'Logged out from all devices successfully')
})

export const requestPasswordReset = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { email } = req.body

  if (!email) {
    throw new AppError('Email is required', constants.HTTP_STATUS.BAD_REQUEST)
  }

  await authService.requestPasswordReset(email)

  sendResponse(res, null, 'If your email is registered, you will receive a password reset link')
})

export const resetPassword = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { email, token, newPassword } = req.body

  if (!email || !token || !newPassword) {
    throw new AppError('Email, token and new password are required', constants.HTTP_STATUS.BAD_REQUEST)
  }

  await authService.resetPassword(email, token, newPassword)

  sendResponse(res, null, 'Password reset successfully')
})

export const getCurrentUser = catchAsync(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  sendResponse(res, req.user, 'Current user retrieved successfully')
})

export const supabaseAuth = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { access_token } = req.body

  if (!access_token) {
    throw new AppError('Access token is required', 400)
  }

  const supabaseUser = await authService.verifySupabaseToken(access_token)

  if (!supabaseUser) {
    throw new AppError('Invalid Supabase token', 401)
  }

  await authService.syncSupabaseUser(supabaseUser.id)

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: supabaseUser.email },
        { providerId: supabaseUser.id, provider: 'supabase' }
      ]
    }
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const { token, refreshToken } = await authService.generateTokens(user)
  await authService.saveRefreshToken(user.id, refreshToken)

  sendResponse(res, { user, token, refreshToken }, 'Authenticated with Supabase successfully')
})

export const googleAuthCallback = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('google', { session: false }, async (err: any, profile: any) => {
    if (err || !profile) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
    }

    const email = profile.emails?.[0]?.value
    const name = profile.displayName
    const image = profile.photos?.[0]?.value

    if (!email) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`)
    }

    const result = await authService.socialLogin('google', profile.id, email, name, image)

    try {
      await supabase.auth.admin.createUser({
        email,
        user_metadata: { name, avatar_url: image },
        email_confirm: true
      })
    } catch (supabaseError) {
      logger.warn('Could not create Supabase user:', supabaseError)
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-callback?token=${result.token}&refreshToken=${result.refreshToken}`
    )
  })(req, res, next)
})

export const facebookAuthCallback = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  passport.authenticate('facebook', { session: false }, async (err: any, profile: any) => {
    if (err || !profile) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`)
    }

    const email = profile.emails?.[0]?.value
    const name = profile.displayName
    const image = profile.photos?.[0]?.value

    if (!email) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`)
    }

    const result = await authService.socialLogin('facebook', profile.id, email, name, image)

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-callback?token=${result.token}&refreshToken=${result.refreshToken}`
    )
  })(req, res, _next)
})

export const facebookAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next)
}

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
}