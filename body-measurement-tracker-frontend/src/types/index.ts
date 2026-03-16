// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  fitnessGoals?: FitnessGoals | null;
}

export interface FitnessGoals {
  id: string;
  userId: string;
  targetWeight?: number | null;
  targetBodyFat?: number | null;
  startDate?: Date | null;
  targetDate?: Date | null;
  notes?: string | null;
}

// Measurement Types
export interface Measurement {
  id: string;
  userId: string;
  date: Date;
  weight?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  thighs?: number | null;
  biceps?: number | null;
  bodyFat?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MeasurementField = keyof Omit<Measurement, 'id' | 'userId' | 'date' | 'createdAt' | 'updatedAt' | 'notes'>;

export interface MeasurementFormData {
  date: Date;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  thighs?: number;
  biceps?: number;
  bodyFat?: number;
  notes?: string;
}

// Chart Types
export interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export interface ChartConfig {
  field: MeasurementField;
  color: string;
  label: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Profile Types
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  image?: string;
  fitnessGoals?: Partial<FitnessGoals>;
}