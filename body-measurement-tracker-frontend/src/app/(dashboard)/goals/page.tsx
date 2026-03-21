'use client'

import { useProfile } from '@/hooks/useProfile'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Label } from '@/components/ui/Label'
import { Spinner } from '@/components/ui/Spinner'
import { Target } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useState } from 'react'

const goalsSchema = z.object({
  targetWeight: z.number().min(20).max(300).optional().nullable(),
  targetBodyFat: z.number().min(3).max(60).optional().nullable(),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

type GoalsFormData = z.infer<typeof goalsSchema>

export default function GoalsPage() {
  const { profile, isLoading, updateProfile } = useProfile()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      targetWeight: profile?.fitnessGoals?.targetWeight || null,
      targetBodyFat: profile?.fitnessGoals?.targetBodyFat || null,
      startDate: profile?.fitnessGoals?.startDate
        ? new Date(profile.fitnessGoals.startDate).toISOString().split('T')[0]
        : '',
      targetDate: profile?.fitnessGoals?.targetDate
        ? new Date(profile.fitnessGoals.targetDate).toISOString().split('T')[0]
        : '',
      notes: profile?.fitnessGoals?.notes || '',
    },
  })

  const onSubmit = async (data: GoalsFormData) => {
    setIsSaving(true)
    const result = await updateProfile({ fitnessGoals: data })
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Fitness goals saved successfully',
      })
    }
    setIsSaving(false)
  }

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
        <h1 className="text-3xl font-bold">Fitness Goals</h1>
        <p className="text-muted-foreground mt-1">
          Set and track your fitness targets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Target Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profile?.fitnessGoals?.targetWeight
                ? `${profile.fitnessGoals.targetWeight} kg`
                : 'Not set'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Target Body Fat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profile?.fitnessGoals?.targetBodyFat
                ? `${profile.fitnessGoals.targetBodyFat}%`
                : 'Not set'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Target Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profile?.fitnessGoals?.targetDate
                ? new Date(profile.fitnessGoals.targetDate).toLocaleDateString()
                : 'Not set'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Goals</CardTitle>
          <CardDescription>Set your fitness targets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.1"
                label="Target Weight (kg)"
                error={errors.targetWeight?.message}
                {...register('targetWeight', { valueAsNumber: true })}
              />
              <Input
                type="number"
                step="0.1"
                label="Target Body Fat %"
                error={errors.targetBodyFat?.message}
                {...register('targetBodyFat', { valueAsNumber: true })}
              />
              <div>
                <Label>Start Date</Label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('startDate')}
                />
              </div>
              <div>
                <Label>Target Date</Label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register('targetDate')}
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Additional notes about your goals..."
                {...register('notes')}
              />
            </div>
            <Button type="submit" isLoading={isSaving}>
              <Target className="h-4 w-4 mr-2" />
              Save Goals
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}