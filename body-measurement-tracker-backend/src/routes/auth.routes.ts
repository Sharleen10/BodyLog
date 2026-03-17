import { Router } from 'express'
import { body } from 'express-validator'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'
import { authRateLimiter } from '../middlewares/rateLimiter.middleware'

const router = Router()

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required').trim().escape(),
]

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
]

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
]

const passwordResetValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
]

const newPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
]

// Routes
router.post('/register', validate(registerValidation), authController.register)
router.post('/login', authRateLimiter, validate(loginValidation), authController.login)
router.post('/refresh-token', validate(refreshTokenValidation), authController.refreshToken)
router.post('/logout', authenticate, authController.logout)
router.post('/logout-all', authenticate, authController.logoutAll)
router.post('/request-password-reset', validate(passwordResetValidation), authController.requestPasswordReset)
router.post('/reset-password', validate(newPasswordValidation), authController.resetPassword)
router.get('/me', authenticate, authController.getCurrentUser)

// OAuth routes
router.get('/google', authController.googleAuth)
router.get('/google/callback', authController.googleAuthCallback)
router.get('/facebook', authController.facebookAuth)
router.get('/facebook/callback', authController.facebookAuthCallback)

export default router