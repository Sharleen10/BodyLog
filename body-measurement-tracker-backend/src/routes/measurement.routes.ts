import { Router } from 'express'
import { body } from 'express-validator'
import * as measurementController from '../controllers/measurement.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'

const router = Router()

// Validation rules
const measurementValidation = [
  body('date').optional().isISO8601().toDate().withMessage('Invalid date format'),
  body('weight').optional().isFloat({ min: 0, max: 500 }).withMessage('Weight must be between 0 and 500'),
  body('chest').optional().isFloat({ min: 0, max: 300 }).withMessage('Chest must be between 0 and 300'),
  body('waist').optional().isFloat({ min: 0, max: 300 }).withMessage('Waist must be between 0 and 300'),
  body('hips').optional().isFloat({ min: 0, max: 300 }).withMessage('Hips must be between 0 and 300'),
  body('thighs').optional().isFloat({ min: 0, max: 200 }).withMessage('Thighs must be between 0 and 200'),
  body('biceps').optional().isFloat({ min: 0, max: 200 }).withMessage('Biceps must be between 0 and 200'),
  body('bodyFat').optional().isFloat({ min: 0, max: 100 }).withMessage('Body fat must be between 0 and 100'),
  body('notes').optional().isString().trim().escape(),
]

// Apply authentication to all measurement routes
router.use(authenticate)

// Measurement routes
router.post('/', validate(measurementValidation), measurementController.createMeasurement)
router.post('/bulk', measurementController.bulkCreateMeasurements)
router.get('/', measurementController.getMeasurements)
router.get('/stats', measurementController.getMeasurementStats)
router.get('/progress', measurementController.getProgressData)
router.get('/:id', measurementController.getMeasurementById)
router.put('/:id', validate(measurementValidation), measurementController.updateMeasurement)
router.delete('/:id', measurementController.deleteMeasurement)

export default router