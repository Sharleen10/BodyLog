import { useState, useEffect, useCallback } from 'react'
import { Measurement, MeasurementFormData } from '@/types'
import { measurementsApi } from '@/lib/api/endpoints'
import { useToast } from './useToast'

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMeasurements = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await measurementsApi.getAll()
      setMeasurements(response.data.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch measurements')
      toast({
        title: 'Error',
        description: 'Failed to fetch measurements',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchMeasurements()
  }, [fetchMeasurements])

  const addMeasurement = async (data: MeasurementFormData) => {
    try {
      const response = await measurementsApi.create(data)
      setMeasurements(prev => [...prev, response.data.data!].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
      toast({
        title: 'Success',
        description: 'Measurement added successfully',
      })
      return { success: true }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add measurement',
        variant: 'destructive',
      })
      return { success: false, error: err.response?.data?.message }
    }
  }

  const updateMeasurement = async (id: string, data: MeasurementFormData) => {
    try {
      const response = await measurementsApi.update(id, data)
      setMeasurements(prev => 
        prev.map(m => m.id === id ? response.data.data! : m)
      )
      toast({
        title: 'Success',
        description: 'Measurement updated successfully',
      })
      return { success: true }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update measurement',
        variant: 'destructive',
      })
      return { success: false, error: err.response?.data?.message }
    }
  }

  const deleteMeasurement = async (id: string) => {
    try {
      await measurementsApi.delete(id)
      setMeasurements(prev => prev.filter(m => m.id !== id))
      toast({
        title: 'Success',
        description: 'Measurement deleted successfully',
      })
      return { success: true }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete measurement',
        variant: 'destructive',
      })
      return { success: false, error: err.response?.data?.message }
    }
  }

  const getMeasurementById = (id: string) => {
    return measurements.find(m => m.id === id)
  }

  return {
    measurements,
    isLoading,
    error,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    getMeasurementById,
    refreshMeasurements: fetchMeasurements,
  }
}