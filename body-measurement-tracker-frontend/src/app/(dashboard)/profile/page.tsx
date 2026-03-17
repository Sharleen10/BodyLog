'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile } from '@/hooks/useProfile'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Separator } from '@/components/ui/Separator'
import { Label } from '@/components/ui/Label'
import { Camera, Save, Key, Target } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const goalsSchema = z.object({
  targetWeight: z.number().min(20, 'Weight must be at least 20kg').max(300, 'Weight cannot exceed 300kg').optional().nullable(),
  targetBodyFat: z.number().min(3, 'Body fat must be at least 3%').max(60, 'Body fat cannot exceed 60%').optional().nullable(),
  startDate: z.date().optional().nullable(),
  targetDate: z.date().optional().nullable(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>
type GoalsFormData = z.infer<typeof goalsSchema>

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const { profile, isLoading, updateProfile, uploadImage, deleteImage, changePassword } = useProfile()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdatingGoals, setIsUpdatingGoals] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const {
    register: registerGoals,
    handleSubmit: handleGoalsSubmit,
    formState: { errors: goalsErrors },
    reset: resetGoals,
  } = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      targetWeight: profile?.fitnessGoals?.targetWeight || null,
      targetBodyFat: profile?.fitnessGoals?.targetBodyFat || null,
      startDate: profile?.fitnessGoals?.startDate ? new Date(profile.fitnessGoals.startDate) : null,
      targetDate: profile?.fitnessGoals?.targetDate ? new Date(profile.fitnessGoals.targetDate) : null,
      notes: profile?.fitnessGoals?.notes || '',
    },
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    const result = await updateProfile(data)
    if (result.success) {
      await updateSession({ ...session, user: { ...session?.user, ...data } })
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    const result = await changePassword(data.currentPassword, data.newPassword)
    if (result.success) {
      resetPassword()
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      })
    }
    setIsChangingPassword(false)
  }

  const onGoalsSubmit = async (data: GoalsFormData) => {
    setIsUpdatingGoals(true)
    const result = await updateProfile({ fitnessGoals: data })
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Fitness goals updated successfully',
      })
    }
    setIsUpdatingGoals(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const result = await uploadImage(file)
    if (result.success) {
      await updateSession({ ...session, user: { ...session?.user, image: result.data?.imageUrl } })
      toast({
        title: 'Success',
        description: 'Profile image updated',
      })
    }
    setIsUploading(false)
  }

  const handleImageDelete = async () => {
    const result = await deleteImage()
    if (result.success) {
      await updateSession({ ...session, user: { ...session?.user, image: null } })
      toast({
        title: 'Success',
        description: 'Profile image removed',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const userInitials = profile?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and set fitness goals
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="goals">Fitness Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.image || ''} alt={profile?.name} />
                  <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </Button>
                  {profile?.image && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImageDelete}
                    >
                      Remove
                    </Button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <Separator />

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <Input
                  label="Name"
                  error={profileErrors.name?.message}
                  {...registerProfile('name')}
                />
                <Input
                  label="Email"
                  type="email"
                  error={profileErrors.email?.message}
                  {...registerProfile('email')}
                />
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is secure by using a strong password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <Input
                  type="password"
                  label="Current Password"
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword')}
                />
                <Input
                  type="password"
                  label="New Password"
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword')}
                />
                <Input
                  type="password"
                  label="Confirm New Password"
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword')}
                />
                <Button type="submit" isLoading={isChangingPassword}>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Fitness Goals</CardTitle>
              <CardDescription>
                Set your target measurements and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGoalsSubmit(onGoalsSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    step="0.1"
                    label="Target Weight (kg)"
                    error={goalsErrors.targetWeight?.message}
                    {...registerGoals('targetWeight', { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    label="Target Body Fat %"
                    error={goalsErrors.targetBodyFat?.message}
                    {...registerGoals('targetBodyFat', { valueAsNumber: true })}
                  />
                  <div>
                    <Label>Start Date</Label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...registerGoals('startDate', { 
                        valueAsDate: true,
                        setValueAs: (v) => v ? new Date(v) : null
                      })}
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...registerGoals('targetDate', { 
                        valueAsDate: true,
                        setValueAs: (v) => v ? new Date(v) : null
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Notes</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Additional notes about your goals..."
                    {...registerGoals('notes')}
                  />
                  {goalsErrors.notes && (
                    <p className="mt-1 text-sm text-red-600">{goalsErrors.notes.message}</p>
                  )}
                </div>

                <Button type="submit" isLoading={isUpdatingGoals}>
                  <Target className="h-4 w-4 mr-2" />
                  Save Goals
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}