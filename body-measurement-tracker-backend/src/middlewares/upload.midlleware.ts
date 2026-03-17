import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { AppError } from '../utils/AppError'
import sharp from 'sharp'
import { constants } from '../config/constants'

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), constants.UPLOAD.DIRECTORY, 'profiles')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.memoryStorage()

const fileFilter = (req: any, file: any, cb: any) => {
  if (constants.UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError('Invalid file type. Only images are allowed.', constants.HTTP_STATUS.BAD_REQUEST), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: constants.UPLOAD.MAX_SIZE,
  },
})

// Image processing middleware
export const processImage = async (req: any, res: any, next: any) => {
  if (!req.file) {
    return next()
  }

  try {
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`
    const filepath = path.join(uploadDir, filename)

    // Process image with sharp
    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(filepath)

    req.file.filename = filename
    req.file.path = `/uploads/profiles/${filename}`
    next()
  } catch (error) {
    next(new AppError('Error processing image', constants.HTTP_STATUS.INTERNAL_SERVER))
  }
}

export default upload