import { Router } from 'express'
import { body } from 'express-validator'
import * as userController from '../controllers/user.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'
import upload, { processImage } from '../middlewares/upload.middleware'

const router = Router()

// Validation rules
const profileUpdateValidation = [
  body('name').optional().trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
]

const goalsValidation = [
  body('targetWeight').optional().isFloat({ min: 0, max: 500 }),
  body('targetBodyFat').optional().isFloat({ min: 0, max: 100 }),
  body('startDate').optional().isISO8601().toDate(),
  body('targetDate').optional().isISO8601().toDate(),
  body('notes').optional().isString().trim().escape(),
]

const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
]

// Apply authentication to all user routes
router.use(authenticate)

// Profile routes
router.get('/profile', userController.getProfile)
router.put('/profile', validate(profileUpdateValidation), userController.updateProfile)
router.post('/profile/image', 
  upload.single('image'), 
  processImage, 
  userController.uploadProfileImage
)
router.delete('/profile/image', userController.deleteProfileImage)

// Goals routes
router.get('/goals', userController.getGoals)
router.put('/goals', validate(goalsValidation), userController.updateGoals)

// Account routes
router.put('/change-password', validate(passwordChangeValidation), userController.changePassword)
router.delete('/account', userController.deleteAccount)
router.get('/stats', userController.getUserStats)

export default router