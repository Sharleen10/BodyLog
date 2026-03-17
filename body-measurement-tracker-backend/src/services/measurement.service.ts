import prisma from '../config/database'
import { AppError } from '../utils/AppError'
import { MeasurementRequestBody, PaginationParams, DateRangeParams, MeasurementStats } from '../types'
import { logger } from '../utils/logger'

type PrismaMeasurement = Awaited<ReturnType<typeof prisma.measurement.findMany>>[number]
type NumericMeasurementField = 'weight' | 'chest' | 'waist' | 'hips' | 'thighs' | 'biceps' | 'bodyFat'

export class MeasurementService {
  private static instance: MeasurementService

  private constructor() {}

  public static getInstance(): MeasurementService {
    if (!MeasurementService.instance) {
      MeasurementService.instance = new MeasurementService()
    }
    return MeasurementService.instance
  }

  async createMeasurement(userId: string, data: MeasurementRequestBody) {
    const measurement = await prisma.measurement.create({
      data: {
        userId,
        date: data.date || new Date(),
        weight: data.weight,
        chest: data.chest,
        waist: data.waist,
        hips: data.hips,
        thighs: data.thighs,
        biceps: data.biceps,
        bodyFat: data.bodyFat,
        notes: data.notes,
      },
    })

    logger.info(`Measurement created for user: ${userId}`)
    return measurement
  }

  async getMeasurements(
    userId: string,
    pagination: PaginationParams,
    dateRange?: DateRangeParams
  ) {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = pagination
    const skip = (page - 1) * limit

    const where: any = { userId }

    if (dateRange?.startDate || dateRange?.endDate) {
      where.date = {}
      if (dateRange.startDate) where.date.gte = dateRange.startDate
      if (dateRange.endDate) where.date.lte = dateRange.endDate
    }

    const [measurements, total] = await Promise.all([
      prisma.measurement.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.measurement.count({ where }),
    ])

    return {
      data: measurements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getMeasurementById(userId: string, measurementId: string) {
    const measurement = await prisma.measurement.findFirst({
      where: { id: measurementId, userId },
    })

    if (!measurement) {
      throw new AppError('Measurement not found', 404)
    }

    return measurement
  }

  async updateMeasurement(
    userId: string,
    measurementId: string,
    data: MeasurementRequestBody
  ) {
    const measurement = await this.getMeasurementById(userId, measurementId)

    const updated = await prisma.measurement.update({
      where: { id: measurement.id },
      data: {
        date: data.date,
        weight: data.weight,
        chest: data.chest,
        waist: data.waist,
        hips: data.hips,
        thighs: data.thighs,
        biceps: data.biceps,
        bodyFat: data.bodyFat,
        notes: data.notes,
      },
    })

    logger.info(`Measurement updated: ${measurementId}`)
    return updated
  }

  async deleteMeasurement(userId: string, measurementId: string) {
    const measurement = await this.getMeasurementById(userId, measurementId)

    await prisma.measurement.delete({
      where: { id: measurement.id },
    })

    logger.info(`Measurement deleted: ${measurementId}`)
    return { success: true, message: 'Measurement deleted successfully' }
  }

  async getMeasurementStats(userId: string): Promise<MeasurementStats> {
    const measurements = await prisma.measurement.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    })

    if (measurements.length === 0) {
      return {
        totalMeasurements: 0,
        firstMeasurement: null,
        latestMeasurement: null,
        averages: {},
        changes: {},
        dateRange: { start: new Date(), end: new Date() },
      }
    }

    const first: PrismaMeasurement = measurements[0]
    const latest: PrismaMeasurement = measurements[measurements.length - 1]
    const fields: NumericMeasurementField[] = ['weight', 'chest', 'waist', 'hips', 'thighs', 'biceps', 'bodyFat']

    // Calculate averages
    const averages: Record<string, number> = {}
    fields.forEach((field) => {
      const values = measurements
        .map((m: PrismaMeasurement) => m[field])
        .filter((v: number | null): v is number => v !== null)

      if (values.length > 0) {
        averages[field] = values.reduce((a: number, b: number) => a + b, 0) / values.length
      }
    })

    // Calculate changes (latest vs first)
    const changes: Record<string, { absolute: number; percentage: number }> = {}
    fields.forEach((field) => {
      const firstVal: number | null = first[field]
      const latestVal: number | null = latest[field]

      if (firstVal !== null && latestVal !== null) {
        changes[field] = {
          absolute: latestVal - firstVal,
          percentage: ((latestVal - firstVal) / firstVal) * 100,
        }
      }
    })

    return {
      totalMeasurements: measurements.length,
      firstMeasurement: first,
      latestMeasurement: latest,
      averages,
      changes,
      dateRange: { start: first.date, end: latest.date },
    }
  }

  async getProgressData(userId: string, fields: NumericMeasurementField[] = ['weight']) {
    const measurements = await prisma.measurement.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    })

    return measurements.map((m: PrismaMeasurement) => ({
      date: m.date,
      ...fields.reduce<Record<string, number | null>>(
        (acc, field) => ({ ...acc, [field]: m[field] }),
        {}
      ),
    }))
  }

  async bulkCreateMeasurements(userId: string, measurements: MeasurementRequestBody[]) {
    const created = await prisma.measurement.createMany({
      data: measurements.map((m: MeasurementRequestBody) => ({
        userId,
        date: m.date || new Date(),
        weight: m.weight,
        chest: m.chest,
        waist: m.waist,
        hips: m.hips,
        thighs: m.thighs,
        biceps: m.biceps,
        bodyFat: m.bodyFat,
        notes: m.notes,
      })),
    })

    logger.info(`${created.count} measurements created in bulk for user: ${userId}`)
    return created
  }
}