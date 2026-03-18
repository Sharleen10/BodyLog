import { Request, Response, NextFunction } from 'express'
import { MeasurementService } from '../services/measurement.service'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'
import { MeasurementRequestBody } from '../types'
import { sendResponse } from '../utils/helpers'
import { constants } from '../config/constants'

type NumericMeasurementField = 'weight' | 'chest' | 'waist' | 'hips' | 'thighs' | 'biceps' | 'bodyFat'

const VALID_FIELDS: NumericMeasurementField[] = [
  'weight', 'chest', 'waist', 'hips', 'thighs', 'biceps', 'bodyFat'
]

const isValidField = (field: string): field is NumericMeasurementField =>
  VALID_FIELDS.includes(field as NumericMeasurementField)

const measurementService = MeasurementService.getInstance()

export const createMeasurement = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.id
  const data: MeasurementRequestBody = req.body

  const measurement = await measurementService.createMeasurement(userId, data)

  sendResponse(res, measurement, 'Measurement created successfully', constants.HTTP_STATUS.CREATED)
})

export const getMeasurements = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.id
  const { page, limit, sortBy, sortOrder, startDate, endDate } = req.query

  const pagination = {
    page: page ? parseInt(page as string) : constants.PAGINATION.DEFAULT_PAGE,
    limit: limit ? parseInt(limit as string) : constants.PAGINATION.DEFAULT_LIMIT,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  }

  const dateRange = {
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  }

  const result = await measurementService.getMeasurements(userId, pagination, dateRange)

  sendResponse(res, result.data, 'Measurements retrieved successfully')
})

export const getMeasurementById = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.id
  const { id } = req.params

  const measurement = await measurementService.getMeasurementById(userId, id)

  sendResponse(res, measurement, 'Measurement retrieved successfully')
})

export const updateMeasurement = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.id
  const { id } = req.params
  const data: MeasurementRequestBody = req.body

  const measurement = await measurementService.updateMeasurement(userId, id, data)

  sendResponse(res, measurement, 'Measurement updated successfully')
})

export const deleteMeasurement = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.id
  const { id } = req.params

  const result = await measurementService.deleteMeasurement(userId, id)

  sendResponse(res, null, result.message)
})

export const getMeasurementStats = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const userId = req.user!.id

  const stats = await measurementService.getMeasurementStats(userId)

  sendResponse(res, stats, 'Statistics retrieved successfully')
})

export const getProgressData = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id
  const { fields } = req.query

  const fieldArray: NumericMeasurementField[] = fields
    ? (fields as string).split(',').filter(isValidField)
    : ['weight']

  if (fieldArray.length === 0) {
    return next(new AppError(
      `Invalid fields. Valid options are: ${VALID_FIELDS.join(', ')}`,
      constants.HTTP_STATUS.BAD_REQUEST
    ))
  }

  const progress = await measurementService.getProgressData(userId, fieldArray)

  sendResponse(res, progress, 'Progress data retrieved successfully')
})

export const bulkCreateMeasurements = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id
  const { measurements } = req.body

  if (!Array.isArray(measurements) || measurements.length === 0) {
    return next(new AppError(
      'Please provide an array of measurements',
      constants.HTTP_STATUS.BAD_REQUEST
    ))
  }

  const created = await measurementService.bulkCreateMeasurements(userId, measurements)

  sendResponse(res, created, `Successfully created ${created.count} measurements`, constants.HTTP_STATUS.CREATED)
})