import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const measurementSchema = z.object({
  date: z.date().optional(),
  weight: z.number().min(0).max(500).optional(),
  chest: z.number().min(0).max(300).optional(),
  waist: z.number().min(0).max(300).optional(),
  hips: z.number().min(0).max(300).optional(),
  thighs: z.number().min(0).max(200).optional(),
  biceps: z.number().min(0).max(200).optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
})

export const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  targetWeight: z.number().min(0).max(500).optional(),
  targetBodyFat: z.number().min(0).max(100).optional(),
  startDate: z.date().optional(),
  targetDate: z.date().optional(),
  notes: z.string().max(500).optional(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})