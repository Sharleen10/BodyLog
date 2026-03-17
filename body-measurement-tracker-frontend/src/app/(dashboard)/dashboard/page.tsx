'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import MeasurementChart from '@/components/dashboard/MeasurementChart'
import RecentMeasurements from '@/components/dashboard/RecentMeasurements'
import ProgressSummary from '@/components/dashboard/ProgressSummary'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useMeasurements } from '@/hooks/useMeasurements'
import { Spinner } from '@/components/ui/Spinner'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { measurements, isLoading, error } = useMeasurements()

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session.user?.name}
          </p>
        </div>
        <Link href="/measurements/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Measurement
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <DashboardStats measurements={measurements} />
          
          <MeasurementChart measurements={measurements} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentMeasurements measurements={measurements.slice(0, 5)} />
            <ProgressSummary 
              measurements={measurements} 
              goals={null} // Add goals fetching later
            />
          </div>
        </>
      )}
    </div>
  )
}