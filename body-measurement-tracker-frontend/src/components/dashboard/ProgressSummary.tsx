import { Measurement } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { calculateProgress } from '@/lib/utils/chartHelpers'

interface ProgressSummaryProps {
  measurements: Measurement[]
  goals: {
    targetWeight?: number | null
    targetBodyFat?: number | null
    startDate?: Date | null
    targetDate?: Date | null
  } | null
}

export default function ProgressSummary({ measurements, goals }: ProgressSummaryProps) {
  if (!goals || measurements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Set your fitness goals to see progress tracking
          </p>
        </CardContent>
      </Card>
    )
  }

  const latestMeasurement = measurements[measurements.length - 1]
  const firstMeasurement = measurements[0]

  const weightProgress = goals.targetWeight && latestMeasurement.weight && firstMeasurement.weight
    ? calculateProgress(
        latestMeasurement.weight,
        goals.targetWeight,
        firstMeasurement.weight
      )
    : null

  const bodyFatProgress = goals.targetBodyFat && latestMeasurement.bodyFat && firstMeasurement.bodyFat
    ? calculateProgress(
        latestMeasurement.bodyFat,
        goals.targetBodyFat,
        firstMeasurement.bodyFat
      )
    : null

  const daysSinceStart = goals.startDate
    ? Math.floor((new Date().getTime() - new Date(goals.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const daysUntilTarget = goals.targetDate
    ? Math.floor((new Date(goals.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {weightProgress !== null && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Weight Goal Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(weightProgress)}%
              </span>
            </div>
            <Progress value={weightProgress} className="h-2" />
          </div>
        )}

        {bodyFatProgress !== null && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Body Fat Goal Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(bodyFatProgress)}%
              </span>
            </div>
            <Progress value={bodyFatProgress} className="h-2" />
          </div>
        )}

        {goals.targetDate && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{daysSinceStart}</div>
                <div className="text-xs text-muted-foreground">Days Since Start</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.max(0, daysUntilTarget)}</div>
                <div className="text-xs text-muted-foreground">Days Remaining</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}