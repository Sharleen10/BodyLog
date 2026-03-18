import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { logger } from '../utils/logger'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { constants } from '../config/constants'

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    })
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(constants.HTTP_STATUS.CONFLICT).json({
          success: false,
          message: 'Duplicate entry. A record with this value already exists.',
        })
      case 'P2025':
        return res.status(constants.HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Record not found.',
        })
      default:
        return res.status(constants.HTTP_STATUS.INTERNAL_SERVER).json({
          success: false,
          message: 'Database error occurred.',
        })
    }
  }

  if (err instanceof PrismaClientValidationError) {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid data provided.',
    })
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Your token has expired. Please log in again.',
    })
  }

  // Default error
  const statusCode = constants.HTTP_STATUS.INTERNAL_SERVER
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}