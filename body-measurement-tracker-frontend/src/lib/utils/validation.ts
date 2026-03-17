import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const measurementSchema = z.object({
  date: z.date({
    required_error: 'Date is required',
  }),
  weight: z.number().min(20, 'Weight must be at least 20kg').max(300, 'Weight cannot exceed 300kg').optional().nullable(),
  chest: z.number().min(30, 'Chest must be at least 30cm').max(200, 'Chest cannot exceed 200cm').optional().nullable(),
  waist: z.number().min(30, 'Waist must be at least 30cm').max(200, 'Waist cannot exceed 200cm').optional().nullable(),
  hips: z.number().min(30, 'Hips must be at least 30cm').max(200, 'Hips cannot exceed 200cm').optional().nullable(),
  thighs: z.number().min(20, 'Thighs must be at least 20cm').max(150, 'Thighs cannot exceed 150cm').optional().nullable(),
  biceps: z.number().min(15, 'Biceps must be at least 15cm').max(100, 'Biceps cannot exceed 100cm').optional().nullable(),
  bodyFat: z.number().min(3, 'Body fat must be at least 3%').max(60, 'Body fat cannot exceed 60%').optional().nullable(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  targetWeight: z.number().min(20, 'Target weight must be at least 20kg').max(300, 'Target weight cannot exceed 300kg').optional().nullable(),
  targetBodyFat: z.number().min(3, 'Target body fat must be at least 3%').max(60, 'Target body fat cannot exceed 60%').optional().nullable(),
  startDate: z.date().optional().nullable(),
  targetDate: z.date().optional().nullable(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
})