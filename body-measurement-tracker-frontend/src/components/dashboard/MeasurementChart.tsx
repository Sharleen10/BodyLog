'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Measurement, TimeRange, MeasurementField } from '@/types'
import { formatDate, filterMeasurementsByTimeRange } from '@/lib/utils/dateFormatter'
import { chartConfigs } from '@/lib/utils/chartHelpers'

interface MeasurementChartProps {
  measurements: Measurement[]
  title?: string
}

export default function MeasurementChart({ measurements, title = 'Progress Over Time' }: MeasurementChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [selectedFields, setSelectedFields] = useState<MeasurementField[]>(['weight'])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const filtered = filterMeasurementsByTimeRange(measurements, timeRange)
    const formatted = filtered
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(m => ({
        ...m,
        date: formatDate(m.date, 'MMM dd'),
      }))
    setChartData(formatted)
  }, [measurements, timeRange])

  const toggleField = (field: MeasurementField) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={selectedFields[0]}
            onValueChange={(value: MeasurementField) => setSelectedFields([value])}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select measurement" />
            </SelectTrigger>
            <SelectContent>
              {chartConfigs.map(config => (
                <SelectItem key={config.field} value={config.field}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              {selectedFields.map((field, index) => {
                const config = chartConfigs.find(c => c.field === field)
                if (!config) return null
                return (
                  <Line
                    key={field}
                    yAxisId={field === 'bodyFat' ? 'right' : 'left'}
                    type="monotone"
                    dataKey={field}
                    stroke={config.color}
                    activeDot={{ r: 8 }}
                    name={`${config.label} (${config.unit})`}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chartConfigs.map(config => (
            <button
              key={config.field}
              onClick={() => toggleField(config.field)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFields.includes(config.field)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              style={{
                backgroundColor: selectedFields.includes(config.field) ? config.color : undefined
              }}
            >
              {config.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}