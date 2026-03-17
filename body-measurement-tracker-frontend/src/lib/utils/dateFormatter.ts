import { Measurement, TimeRange } from '@/types'

export function formatDate(date: Date | string, format: string = 'PPP'): string {
  const d = new Date(date)
  
  switch (format) {
    case 'yyyy-MM-dd':
      return d.toISOString().split('T')[0]
    case 'MMM dd':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'MMM dd, yyyy':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    case 'PPP':
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    default:
      return d.toISOString().split('T')[0]
  }
}

export function filterMeasurementsByTimeRange(
  measurements: Measurement[],
  range: TimeRange
): Measurement[] {
  const now = new Date()
  const filterDate = new Date()

  switch (range) {
    case 'week':
      filterDate.setDate(now.getDate() - 7)
      break
    case 'month':
      filterDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      filterDate.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      return measurements
  }

  return measurements.filter(m => new Date(m.date) >= filterDate)
}

export function getDateRangeFromTimeRange(range: TimeRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (range) {
    case 'week':
      start.setDate(end.getDate() - 7)
      break
    case 'month':
      start.setMonth(end.getMonth() - 1)
      break
    case 'year':
      start.setFullYear(end.getFullYear() - 1)
      break
    case 'all':
      start.setFullYear(2000)
      break
  }

  return { start, end }
}

export function groupMeasurementsByMonth(measurements: Measurement[]): Record<string, Measurement[]> {
  return measurements.reduce((acc, measurement) => {
    const monthYear = formatDate(measurement.date, 'MMM yyyy')
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(measurement)
    return acc
  }, {} as Record<string, Measurement[]>)
}