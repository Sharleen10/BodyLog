'use client'

import { useState } from 'react'
import { Measurement } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/dateFormatter'
import { Edit, Trash2, ChevronLeft, ChevronRight, Calendar, Ruler, Weight, Percent } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'

interface MeasurementListProps {
  measurements: Measurement[]
  onEdit: (measurement: Measurement) => void
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export default function MeasurementList({ 
  measurements, 
  onEdit, 
  onDelete,
  isLoading = false,
}: MeasurementListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 5

  // Sort measurements by date (newest first)
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const paginatedMeasurements = sortedMeasurements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(sortedMeasurements.length / itemsPerPage)

  const handleDelete = async () => {
    if (deleteId) {
      setIsDeleting(true)
      await onDelete(deleteId)
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const getMeasurementIcon = (field: string) => {
    switch (field) {
      case 'weight':
        return <Weight className="h-3 w-3" />
      case 'chest':
      case 'waist':
      case 'hips':
      case 'thighs':
      case 'biceps':
        return <Ruler className="h-3 w-3" />
      case 'bodyFat':
        return <Percent className="h-3 w-3" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Measurement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Measurement History</CardTitle>
          {sortedMeasurements.length > 0 && (
            <Badge variant="secondary">
              Total: {sortedMeasurements.length} measurements
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {sortedMeasurements.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No measurements yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your progress by adding your first measurement.
              </p>
              <Button onClick={() => onEdit({} as Measurement)}>
                Add Your First Measurement
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedMeasurements.map((measurement) => {
                  // Get all available measurements
                  const availableMeasurements = [
                    { field: 'weight', value: measurement.weight, unit: 'kg' },
                    { field: 'chest', value: measurement.chest, unit: 'cm' },
                    { field: 'waist', value: measurement.waist, unit: 'cm' },
                    { field: 'hips', value: measurement.hips, unit: 'cm' },
                    { field: 'thighs', value: measurement.thighs, unit: 'cm' },
                    { field: 'biceps', value: measurement.biceps, unit: 'cm' },
                    { field: 'bodyFat', value: measurement.bodyFat, unit: '%' },
                  ].filter(m => m.value != null)

                  return (
                    <div
                      key={measurement.id}
                      className="group relative border rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      {/* Header with date and actions */}
                      <div className="p-4 bg-muted/5 rounded-t-lg border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                              {formatDate(measurement.date, 'PPP')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(measurement)}
                              className="h-8 px-2"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(measurement.id)}
                              className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Measurements grid */}
                      <div className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {availableMeasurements.map(({ field, value, unit }) => (
                            <div
                              key={field}
                              className="flex items-center space-x-2 bg-secondary/20 rounded-md px-3 py-2"
                            >
                              {getMeasurementIcon(field)}
                              <div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {field.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="font-medium">
                                  {value} {unit}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Notes section */}
                        {measurement.notes && (
                          <>
                            <Separator className="my-3" />
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Notes:</span>{' '}
                              {measurement.notes}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, sortedMeasurements.length)} of{' '}
                    {sortedMeasurements.length} measurements
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1
                        // Show current page, first, last, and adjacent pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          )
                        } else if (
                          page === 2 && currentPage > 3 ||
                          page === totalPages - 1 && currentPage < totalPages - 2
                        ) {
                          return <span key={page} className="px-2">...</span>
                        }
                        return null
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              measurement from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}