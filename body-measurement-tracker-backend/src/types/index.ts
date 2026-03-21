// types/index.ts
import { Request } from 'express'

/** ----------------------
 * User & Profile Types
 * ---------------------- */
export interface User {
  id: string
  email: string
  name: string
  image?: string | null
  provider?: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  fitnessGoals?: FitnessGoals | null
}

export interface ProfileUpdateData {
  name?: string
  email?: string
  image?: string
  fitnessGoals?: {
    targetWeight?: number | null
    targetBodyFat?: number | null
    startDate?: Date | string | null
    targetDate?: Date | string | null
    notes?: string | null
  }
}

export interface FitnessGoals {
  id: string
  userId: string
  targetWeight?: number | null
  targetBodyFat?: number | null
  startDate?: Date | null
  targetDate?: Date | null
  notes?: string | null
}

export interface GoalsUpdateData {
  targetWeight?: number | null
  targetBodyFat?: number | null
  startDate?: Date | string | null
  targetDate?: Date | string | null
  notes?: string | null
}

/** ----------------------
 * Measurements
 * ---------------------- */
export interface Measurement {
  id: string
  userId: string
  date: Date
  weight?: number | null
  chest?: number | null
  waist?: number | null
  hips?: number | null
  thighs?: number | null
  biceps?: number | null
  bodyFat?: number | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MeasurementRequestBody {
  date?: Date
  weight?: number
  chest?: number
  waist?: number
  hips?: number
  thighs?: number
  biceps?: number
  bodyFat?: number
  notes?: string
}

/** ----------------------
 * Auth Types
 * ---------------------- */
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface RegisterRequestBody {
  email: string
  password: string
  name: string
}

export interface JwtPayload {
  id: string
  email: string
  name: string
  iat?: number
  exp?: number
}

/** ----------------------
 * API Response & Pagination
 * ---------------------- */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: any[]
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeParams {
  startDate?: Date
  endDate?: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/** ----------------------
 * Measurement Stats
 * ---------------------- */
export interface MeasurementStats {
  totalMeasurements: number
  firstMeasurement: Measurement | null
  latestMeasurement: Measurement | null
  averages: Record<string, number>
  changes: Record<string, { absolute: number; percentage: number }>
  dateRange: {
    start: Date
    end: Date
  }
}