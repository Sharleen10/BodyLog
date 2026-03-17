import { Measurement } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils/dateFormatter'
import { Weight, Ruler, Percent, Activity } from 'lucide-react'

interface MeasurementCardProps {
  measurement: Measurement
}

export default function MeasurementCard({ measurement }: MeasurementCardProps) {
  const stats = [
    { icon: Weight, label: 'Weight', value: measurement.weight, unit: 'kg' },
    { icon: Ruler, label: 'Chest', value: measurement.chest, unit: 'cm' },
    { icon: Ruler, label: 'Waist', value: measurement.waist, unit: 'cm' },
    { icon: Ruler, label: 'Hips', value: measurement.hips, unit: 'cm' },
    { icon: Ruler, label: 'Thighs', value: measurement.thighs, unit: 'cm' },
    { icon: Ruler, label: 'Biceps', value: measurement.biceps, unit: 'cm' },
    { icon: Percent, label: 'Body Fat', value: measurement.bodyFat, unit: '%' },
  ].filter(stat => stat.value != null)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-3">
          {formatDate(measurement.date, 'PPP')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ icon: Icon, label, value, unit }) => (
            <div key={label} className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="font-medium">
                  {value} {unit}
                </div>
              </div>
            </div>
          ))}
        </div>
        {measurement.notes && (
          <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
            {measurement.notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}