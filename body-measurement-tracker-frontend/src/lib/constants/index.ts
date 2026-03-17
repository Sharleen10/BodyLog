import { ChartConfig } from '@/types'

export const MEASUREMENT_FIELDS = [
  { value: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️' },
  { value: 'chest', label: 'Chest', unit: 'cm', icon: '📏' },
  { value: 'waist', label: 'Waist', unit: 'cm', icon: '📐' },
  { value: 'hips', label: 'Hips', unit: 'cm', icon: '📐' },
  { value: 'thighs', label: 'Thighs', unit: 'cm', icon: '📏' },
  { value: 'biceps', label: 'Biceps', unit: 'cm', icon: '💪' },
  { value: 'bodyFat', label: 'Body Fat', unit: '%', icon: '🎯' },
] as const

export const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#a4de6c',
  '#d0ed57',
] as const

export const TIME_RANGES = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All Time' },
] as const

export const CHART_CONFIGS: ChartConfig[] = MEASUREMENT_FIELDS.map((field, index) => ({
  field: field.value,
  color: CHART_COLORS[index % CHART_COLORS.length],
  label: field.label,
  unit: field.unit,
}))

export const APP_NAME = 'Body Measurement Tracker'
export const APP_DESCRIPTION = 'Track your body measurements and progress over time'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  MEASUREMENTS: '/measurements',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  GOALS: '/goals',
  PROGRESS: '/progress',
  CALENDAR: '/calendar',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },
  MEASUREMENTS: {
    BASE: '/measurements',
    STATS: '/measurements/stats',
    PROGRESS: '/measurements/progress',
  },
  USERS: {
    PROFILE: '/users/profile',
    GOALS: '/users/goals',
    CHANGE_PASSWORD: '/users/change-password',
  },
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Successfully registered!',
  LOGOUT: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  MEASUREMENT_ADDED: 'Measurement added successfully!',
  MEASUREMENT_UPDATED: 'Measurement updated successfully!',
  MEASUREMENT_DELETED: 'Measurement deleted successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
} as const

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  THEME: 'theme',
  USER: 'user',
} as const

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

export const DATE_FORMATS = {
  DISPLAY: 'PPP',
  INPUT: 'yyyy-MM-dd',
  CHART: 'MMM dd',
  MONTH_YEAR: 'MMMM yyyy',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [5, 10, 20, 50],
} as const

export const CHART_DIMENSIONS = {
  HEIGHT: 400,
  MOBILE_HEIGHT: 300,
} as const

export const ANIMATION = {
  DURATION: 300,
  EASING: 'ease-in-out',
} as const