// services/user.service.ts
import prisma from '../config/database'
import { AppError } from '../utils/AppError'
import { ProfileUpdateData, FitnessGoals, GoalsUpdateData, User } from '../types'
import { logger } from '../utils/logger'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

export class UserService {
  private static instance: UserService

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  async getProfile(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        fitnessGoals: true,
      },
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async updateProfile(userId: string, data: ProfileUpdateData): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { fitnessGoals: true },
    })
    if (!user) throw new AppError('User not found', 404)

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
      if (existingUser) throw new AppError('Email already in use', 400)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        fitnessGoals: true,
      },
    })

    if (data.fitnessGoals) {
      const goals = data.fitnessGoals
      if (user.fitnessGoals) {
        await prisma.fitnessGoals.update({
          where: { userId },
          data: {
            targetWeight: goals.targetWeight ?? null,
            targetBodyFat: goals.targetBodyFat ?? null,
            startDate: goals.startDate ? new Date(goals.startDate) : null,
            targetDate: goals.targetDate ? new Date(goals.targetDate) : null,
            notes: goals.notes ?? null,
          },
        })
      } else {
        await prisma.fitnessGoals.create({
          data: {
            userId,
            targetWeight: goals.targetWeight ?? null,
            targetBodyFat: goals.targetBodyFat ?? null,
            startDate: goals.startDate ? new Date(goals.startDate) : null,
            targetDate: goals.targetDate ? new Date(goals.targetDate) : null,
            notes: goals.notes ?? null,
          },
        })
      }
      logger.info(`Fitness goals updated for user: ${userId}`)
    }

    logger.info(`Profile updated for user: ${userId}`)
    return updatedUser
  }

  async updateGoals(userId: string, goals: GoalsUpdateData): Promise<FitnessGoals> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { fitnessGoals: true },
    })
    if (!user) throw new AppError('User not found', 404)

    let updatedGoals: FitnessGoals
    if (user.fitnessGoals) {
      updatedGoals = await prisma.fitnessGoals.update({
        where: { userId },
        data: {
          targetWeight: goals.targetWeight ?? null,
          targetBodyFat: goals.targetBodyFat ?? null,
          startDate: goals.startDate ? new Date(goals.startDate) : null,
          targetDate: goals.targetDate ? new Date(goals.targetDate) : null,
          notes: goals.notes ?? null,
        },
      })
    } else {
      updatedGoals = await prisma.fitnessGoals.create({
        data: {
          userId,
          targetWeight: goals.targetWeight ?? null,
          targetBodyFat: goals.targetBodyFat ?? null,
          startDate: goals.startDate ? new Date(goals.startDate) : null,
          targetDate: goals.targetDate ? new Date(goals.targetDate) : null,
          notes: goals.notes ?? null,
        },
      })
    }

    logger.info(`Goals updated for user: ${userId}`)
    return updatedGoals
  }

  async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<Pick<User, 'id' | 'email' | 'name' | 'image'>> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError('User not found', 404)

    if (user.image) {
      const oldImagePath = path.join(process.cwd(), user.image)
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
    }

    const imageUrl = `/uploads/profiles/${file.filename}`
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: { id: true, email: true, name: true, image: true },
    })

    logger.info(`Profile image uploaded for user: ${userId}`)
    return updatedUser
  }

  async deleteProfileImage(userId: string): Promise<Pick<User, 'id' | 'email' | 'name' | 'image'>> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError('User not found', 404)

    if (user.image) {
      const imagePath = path.join(process.cwd(), user.image)
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: null },
      select: { id: true, email: true, name: true, image: true },
    })

    logger.info(`Profile image deleted for user: ${userId}`)
    return updatedUser
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError('User not found', 404)
    if (user.provider !== 'local') throw new AppError('Cannot change password for social login accounts', 400)

    const isValidPassword = await bcrypt.compare(currentPassword, user.password!)
    if (!isValidPassword) throw new AppError('Current password is incorrect', 401)

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } })

    await prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } })

    logger.info(`Password changed for user: ${userId}`)
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError('User not found', 404)

    if (user.image) {
      const imagePath = path.join(process.cwd(), user.image)
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
    }

    await prisma.user.delete({ where: { id: userId } })
    logger.info(`Account deleted for user: ${userId}`)
  }

  async getUserStats(userId: string): Promise<{ measurementCount: number; hasGoals: boolean; goal: FitnessGoals | null }> {
    const [measurementCount, goal] = await Promise.all([
      prisma.measurement.count({ where: { userId } }),
      prisma.fitnessGoals.findUnique({ where: { userId } }),
    ])

    return {
      measurementCount,
      hasGoals: !!goal,
      goal,
    }
  }
}