'use client'

import { useMeasurements } from '@/hooks/useMeasurements'
import { Spinner } from '@/components/ui/Spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function CalendarPage() {
  const { measurements, isLoading } = useMeasurements()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  const measurementDates = measurements.reduce((acc: Record<string, number>, m: any) => {
    const date = new Date(m.date).toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = today.toLocaleString('default', { month: 'long' })

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">
          View your measurement history by date
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{monthName} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {blanks.map(i => (
              <div key={`blank-${i}`} />
            ))}
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasEntry = measurementDates[dateStr]
              const isToday = day === today.getDate()

              return (
                <div
                  key={day}
                  className={`
                    aspect-square flex items-center justify-center rounded-full text-sm
                    ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                    ${hasEntry && !isToday ? 'bg-green-100 text-green-700 font-medium' : ''}
                    ${!hasEntry && !isToday ? 'text-foreground' : ''}
                  `}
                >
                  {day}
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300" />
              <span>Has measurement</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {measurements.length === 0 ? (
            <p className="text-muted-foreground text-sm">No measurements recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {measurements.slice(0, 10).map((m: any) => (
                <div key={m.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm font-medium">
                    {new Date(m.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {m.weight ? `${m.weight} kg` : 'No weight recorded'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}