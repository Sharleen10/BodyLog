declare global {
  namespace Express {
    interface User {
      id: string
      email: string
      name: string
    }

    interface Request {
      user?: User
      file?: Express.Multer.File
      files?: Express.Multer.File[]
    }
  }
}

export {}