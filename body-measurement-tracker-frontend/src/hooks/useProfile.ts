import { useState, useEffect, useCallback } from 'react'
import { User, ProfileUpdateData } from '@/types'
import { userApi } from '@/lib/api/endpoints'
import { useToast } from './useToast'

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await userApi.getProfile()
      setProfile(response.data.data!)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile')
      toast({
        title: 'Error',
        description: 'Failed to fetch profile',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = async (data: ProfileUpdateData) => {
    try {
      const response = await userApi.updateProfile(data)
      setProfile(response.data.data!)
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      return { success: true }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      })
      return { success: false, error: err.response?.data?.message }
    }
  }

  const uploadImage = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await userApi.uploadImage(formData)
      setProfile(prev => prev ? { ...prev, image: response.data.data!.imageUrl } : null)
      toast({
        title: 'Success',
        description: 'Profile image updated successfully',
      })
      return { success: true }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to upload image',
        variant: 'destructive',
      })
      return { success: false, error: err.response?.data?.message }
    }
  }

  const deleteImage = async () => {
    try {
      await userApi.deleteImage()
      setProfile(prev => prev ? { ...prev, image: null } : null)
      toast({
        title: 'Success',
        description: 'Profile image removed successfully',
      })
      return { success: true }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete image',
        variant: 'destructive',
      })
      return { success: false, error: err.response?.data?.message }
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await userApi.changePassword(currentPassword, newPassword)
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      })
      return { success: true }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to change password',
        variant: 'destructive',
      })
      return { success: false, error: err.response?.data?.message }
    }
  }

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadImage,
    deleteImage,
    changePassword,
    refreshProfile: fetchProfile,
  }
}