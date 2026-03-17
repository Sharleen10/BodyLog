export const constants = {
  // JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'default-secret',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // File Upload
  UPLOAD: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
    DIRECTORY: process.env.UPLOAD_DIR || 'uploads',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER: 500,
  },

  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Providers
  PROVIDERS: {
    LOCAL: 'local',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
  },
} as const