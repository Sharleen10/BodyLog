'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { measurementSchema } from '@/lib/utils/validation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { MeasurementFormData } from '@/types'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

interface MeasurementFormProps {
  initialData?: MeasurementFormData
  onSubmit: (data: MeasurementFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function MeasurementForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: MeasurementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: initialData || {
      date: new Date(),
    },
  })

  const handleFormSubmit = async (data: MeasurementFormData) => {
    await onSubmit(data)
    if (!initialData) {
      reset()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Measurement' : 'Add New Measurement'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('date', { 
                  valueAsDate: true,
                  setValueAs: (v) => v ? new Date(v) : new Date()
                })}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <Input
              type="number"
              step="0.1"
              label="Weight (kg)"
              placeholder="70.5"
              error={errors.weight?.message}
              {...register('weight', { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.1"
              label="Chest (cm)"
              placeholder="95"
              error={errors.chest?.message}
              {...register('chest', { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.1"
              label="Waist (cm)"
              placeholder="80"
              error={errors.waist?.message}
              {...register('waist', { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.1"
              label="Hips (cm)"
              placeholder="90"
              error={errors.hips?.message}
              {...register('hips', { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.1"
              label="Thighs (cm)"
              placeholder="55"
              error={errors.thighs?.message}
              {...register('thighs', { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.1"
              label="Biceps (cm)"
              placeholder="35"
              error={errors.biceps?.message}
              {...register('biceps', { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.1"
              label="Body Fat %"
              placeholder="15"
              error={errors.bodyFat?.message}
              {...register('bodyFat', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional notes (optional)"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={isLoading}>
              {initialData ? 'Update' : 'Save'} Measurement
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}