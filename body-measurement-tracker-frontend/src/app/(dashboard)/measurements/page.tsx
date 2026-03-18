'use client'

import { useState } from 'react'
import { useMeasurements } from '@/hooks/useMeasurements'
import MeasurementList from '@/components/dashboard/MeasurementList'
import MeasurementForm from '@/components/dashboard/MeasurementForm'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from 'lucide-react'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog'
import { Measurement, MeasurementFormData } from '@/types'

export default function MeasurementsPage() {
  const { measurements, isLoading, addMeasurement, updateMeasurement, deleteMeasurement } = useMeasurements()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null)

  const handleSubmit = async (data: MeasurementFormData) => {
    if (editingMeasurement) {
      await updateMeasurement(editingMeasurement.id, data)
    } else {
      await addMeasurement(data)
    }
    setIsFormOpen(false)
    setEditingMeasurement(null)
  }

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    await deleteMeasurement(id)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Measurements</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your body measurements
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Measurement
        </Button>
      </div>

      <MeasurementList
        measurements={measurements}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <AlertDialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingMeasurement ? 'Edit Measurement' : 'Add New Measurement'}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <MeasurementForm
            initialData={editingMeasurement || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingMeasurement(null)
            }}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}