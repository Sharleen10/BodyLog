import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/AppError';
import sharp from 'sharp';

// Ensure upload directory exists
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

// Image processing middleware
export const processImage = async (req: any, _res: any, next: any) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
    const filepath = path.join(uploadDir, filename);

    // Process image with sharp
    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.path = filepath;
    next();
  } catch (error) {
    next(new AppError('Error processing image', 500));
  }
};

export default upload;