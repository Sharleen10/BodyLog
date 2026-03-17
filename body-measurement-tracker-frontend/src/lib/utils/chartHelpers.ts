import { Measurement, ChartConfig, MeasurementField } from '@/types'

export const chartConfigs: ChartConfig[] = [
  { field: 'weight', color: '#8884d8', label: 'Weight', unit: 'kg' },
  { field: 'chest', color: '#82ca9d', label: 'Chest', unit: 'cm' },
  { field: 'waist', color: '#ffc658', label: 'Waist', unit: 'cm' },
  { field: 'hips', color: '#ff7300', label: 'Hips', unit: 'cm' },
  { field: 'thighs', color: '#0088fe', label: 'Thighs', unit: 'cm' },
  { field: 'biceps', color: '#00C49F', label: 'Biceps', unit: 'cm' },
  { field: 'bodyFat', color: '#FFBB28', label: 'Body Fat', unit: '%' },
]

export function prepareChartData(
  measurements: Measurement[],
  fields: MeasurementField[]
): any[] {
  return measurements
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...fields.reduce((acc, field) => ({
        ...acc,
        [field]: m[field]
      }), {})
    }))
}

export function calculateProgress(current: number, target: number, start: number): number {
  if (target === start) return 100
  const progress = ((current - start) / (target - start)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export function getMeasurementStats(measurements: Measurement[]) {
  if (measurements.length === 0) return null

  const latest = measurements[measurements.length - 1]
  const first = measurements[0]
  const total = measurements.length

  const averages: Record<string, number> = {}
  const changes: Record<string, { absolute: number; percentage: number }> = {}

  chartConfigs.forEach(({ field }) => {
    const values = measurements
      .map(m => m[field])
      .filter((v): v is number => v !== null && v !== undefined)
    
    if (values.length > 0) {
      averages[field] = values.reduce((a, b) => a + b, 0) / values.length
    }

    const firstVal = first[field]
    const latestVal = latest[field]
    
    if (firstVal && latestVal) {
      changes[field] = {
        absolute: latestVal - firstVal,
        percentage: ((latestVal - firstVal) / firstVal) * 100
      }
    }
  })

  return { averages, changes, latest, first, total }
}