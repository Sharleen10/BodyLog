import { Measurement } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils/dateFormatter'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface RecentMeasurementsProps {
  measurements: Measurement[]
}

export default function RecentMeasurements({ measurements }: RecentMeasurementsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Measurements</CardTitle>
        <Link href="/measurements">
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {measurements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent measurements
          </div>
        ) : (
          <div className="space-y-4">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {formatDate(measurement.date, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {measurement.weight && `${measurement.weight} kg`}
                    {measurement.weight && measurement.chest && ' · '}
                    {measurement.chest && `${measurement.chest} cm chest`}
                  </div>
                </div>
                <Link href={`/measurements/${measurement.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}