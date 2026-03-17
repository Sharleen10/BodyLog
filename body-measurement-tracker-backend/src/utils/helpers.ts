import { Response } from 'express'
import { ApiResponse } from '../types'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const sendResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  }
  res.status(statusCode).json(response)
}

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: any[]
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  }
  res.status(statusCode).json(response)
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex')
}

export const generateOTP = (length: number = 6): string => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0')
}

export const calculateProgress = (
  current: number,
  target: number,
  start: number
): number => {
  if (target === start) return 100
  const progress = ((current - start) / (target - start)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export const formatDateForDB = (date: Date): string => {
  return date.toISOString()
}

export const parseDateFromDB = (dateStr: string): Date => {
  return new Date(dateStr)
}

export const sanitizeUser = (user: any) => {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}