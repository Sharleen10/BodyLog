'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Measurement } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DashboardStatsProps {
  measurements: Measurement[]
}

export default function DashboardStats({ measurements }: DashboardStatsProps) {
  const calculateChange = (field: keyof Measurement): { value: number; trend: 'up' | 'down' | 'stable' } => {
    if (measurements.length < 2) {
      return { value: 0, trend: 'stable' }
    }

    const sorted = [...measurements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const latest = sorted[0][field] as number
    const previous = sorted[1][field] as number

    if (!latest || !previous) return { value: 0, trend: 'stable' }

    const change = latest - previous
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'

    return { value: Math.abs(change), trend }
  }

  const getLatestValue = (field: keyof Measurement): number | null => {
    if (measurements.length === 0) return null
    
    const sorted = [...measurements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return sorted[0][field] as number || null
  }

  const stats = [
    { label: 'Weight', field: 'weight', unit: 'kg', icon: '⚖️' },
    { label: 'Chest', field: 'chest', unit: 'cm', icon: '📏' },
    { label: 'Waist', field: 'waist', unit: 'cm', icon: '📐' },
    { label: 'Body Fat', field: 'bodyFat', unit: '%', icon: '💪' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, field, unit, icon }) => {
        const latest = getLatestValue(field as keyof Measurement)
        const change = calculateChange(field as keyof Measurement)

        return (
          <Card key={field}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span className="text-lg">{icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latest ? `${latest.toFixed(1)} ${unit}` : '—'}
              </div>
              {change.value > 0 && (
                <div className={cn(
                  'flex items-center text-xs mt-1',
                  change.trend === 'up' ? 'text-green-600' : 
                  change.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                )}>
                  {change.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {change.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {change.trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                  <span>
                    {change.value.toFixed(1)} {unit} from last measurement
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}