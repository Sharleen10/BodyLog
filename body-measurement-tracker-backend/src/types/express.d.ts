declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        name: string
      }
      file?: Express.Multer.File
      files?: Express.Multer.File[]
    }
  }
}

export {}