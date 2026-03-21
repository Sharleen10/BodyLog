'use client'

import { useMeasurements } from '@/hooks/useMeasurements'
import MeasurementChart from '@/components/dashboard/MeasurementChart'
import { Spinner } from '@/components/ui/Spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function ProgressPage() {
  const { measurements, isLoading } = useMeasurements()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground mt-1">
          Visualize your body measurement progress over time
        </p>
      </div>

      <MeasurementChart measurements={measurements} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['weight', 'chest', 'waist'].map((field) => {
          const values = measurements
            .map((m: any) => m[field])
            .filter(Boolean)
          const latest = values[0]
          const oldest = values[values.length - 1]
          const change = latest && oldest ? (latest - oldest).toFixed(1) : null

          return (
            <Card key={field}>
              <CardHeader>
                <CardTitle className="capitalize text-sm font-medium">
                  {field}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {latest ? `${latest} kg` : 'No data'}
                </p>
                {change && (
                  <p className={`text-sm mt-1 ${Number(change) < 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Number(change) > 0 ? '+' : ''}{change} kg overall
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}