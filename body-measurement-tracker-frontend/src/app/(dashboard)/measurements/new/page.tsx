'use client'

import { useRouter } from 'next/navigation'
import { useMeasurements } from '@/hooks/useMeasurements'
import MeasurementForm from '@/components/dashboard/MeasurementForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MeasurementFormData } from '@/types'
import { useToast } from '@/hooks/useToast'

export default function NewMeasurementPage() {
  const router = useRouter()
  const { addMeasurement } = useMeasurements()
  const { toast } = useToast()

  const handleSubmit = async (data: MeasurementFormData) => {
    await addMeasurement(data)
    toast({
      title: 'Success',
      description: 'Measurement added successfully',
    })
    router.push('/measurements')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Add Measurement</h1>
        <p className="text-muted-foreground mt-1">
          Record your body measurements
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Measurement</CardTitle>
        </CardHeader>
        <CardContent>
          <MeasurementForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/measurements')}
          />
        </CardContent>
      </Card>
    </div>
  )
}