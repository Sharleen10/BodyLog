import { api } from './axios'
import { 
  Measurement, 
  MeasurementFormData, 
  ApiResponse, 
  PaginatedResponse,
  MeasurementStats,
  User,
  ProfileUpdateData
} from '@/types'

export const authApi = {
  login: (email: string, password: string) => 
    api.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) => 
    api.post<ApiResponse<{ user: User; token: string; refreshToken: string }>>('/auth/register', { name, email, password }),
  
  logout: (refreshToken: string) => 
    api.post('/auth/logout', { refreshToken }),
  
  refreshToken: (refreshToken: string) => 
    api.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh-token', { refreshToken }),
  
  getCurrentUser: () => 
    api.get<ApiResponse<User>>('/auth/me'),
}

export const measurementsApi = {
  getAll: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => 
    api.get<PaginatedResponse<Measurement>>('/measurements', { params }),
  
  getById: (id: string) => 
    api.get<ApiResponse<Measurement>>(`/measurements/${id}`),
  
  create: (data: MeasurementFormData) => 
    api.post<ApiResponse<Measurement>>('/measurements', data),
  
  update: (id: string, data: Partial<MeasurementFormData>) => 
    api.put<ApiResponse<Measurement>>(`/measurements/${id}`, data),
  
  delete: (id: string) => 
    api.delete<ApiResponse<void>>(`/measurements/${id}`),
  
  getStats: () => 
    api.get<ApiResponse<MeasurementStats>>('/measurements/stats'),
  
  getProgress: (fields?: string[]) => 
    api.get<ApiResponse<any[]>>('/measurements/progress', { params: { fields: fields?.join(',') } }),
}

export const userApi = {
  getProfile: () => 
    api.get<ApiResponse<User>>('/users/profile'),
  
  updateProfile: (data: ProfileUpdateData) => 
    api.put<ApiResponse<User>>('/users/profile', data),
  
  uploadImage: (formData: FormData) => 
    api.post<ApiResponse<{ imageUrl: string }>>('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteImage: () => 
    api.delete<ApiResponse<void>>('/users/profile/image'),
  
  changePassword: (currentPassword: string, newPassword: string) => 
    api.put('/users/change-password', { currentPassword, newPassword }),
  
  getGoals: () => 
    api.get('/users/goals'),
  
  updateGoals: (goals: any) => 
    api.put('/users/goals', goals),
}