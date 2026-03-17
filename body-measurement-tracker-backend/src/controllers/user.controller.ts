// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'
import { AuthRequest, ProfileUpdateData, GoalsUpdateData } from '../types'
import { sendResponse } from '../utils/helpers'
import { constants } from '../config/constants'

const userService = UserService.getInstance()

export const getProfile = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id
  const profile = await userService.getProfile(userId)

  sendResponse(res, profile, 'Profile retrieved successfully')
})

export const updateProfile = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id
  const data: ProfileUpdateData = req.body

  const profile = await userService.updateProfile(userId, data)

  sendResponse(res, profile, 'Profile updated successfully')
})

export const getGoals = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id
  const profile = await userService.getProfile(userId)

  sendResponse(res, profile.fitnessGoals, 'Goals retrieved successfully')
})

export const updateGoals = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id
  const data: GoalsUpdateData = req.body

  const updatedGoals = await userService.updateGoals(userId, data)

  sendResponse(res, updatedGoals, 'Goals updated successfully')
})

export const uploadProfileImage = catchAsync(async (
  req: AuthRequest & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id

  if (!req.file) {
    throw new AppError('No image file provided', constants.HTTP_STATUS.BAD_REQUEST)
  }

  const user = await userService.uploadProfileImage(userId, req.file)

  sendResponse(res, { imageUrl: user.image }, 'Profile image uploaded successfully')
})

export const deleteProfileImage = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id

  await userService.deleteProfileImage(userId)

  sendResponse(res, null, 'Profile image deleted successfully')
})

export const changePassword = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    throw new AppError(
      'Current password and new password are required',
      constants.HTTP_STATUS.BAD_REQUEST
    )
  }

  await userService.changePassword(userId, currentPassword, newPassword)

  sendResponse(res, null, 'Password changed successfully')
})

export const deleteAccount = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id

  await userService.deleteAccount(userId)

  sendResponse(res, null, 'Account deleted successfully')
})

export const getUserStats = catchAsync(async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user!.id

  const stats = await userService.getUserStats(userId)

  sendResponse(res, stats, 'User statistics retrieved successfully')
})