import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { AppError } from '../utils/AppError'
import { constants } from '../config/constants'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, _info: any) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return next(new AppError('Please authenticate', constants.HTTP_STATUS.UNAUTHORIZED))
    }

    req.user = user
    next()
  })(req, res, next)
}

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (_err: any, user: any, _info: any) => {
    if (user) {
      req.user = user
    }
    next()
  })(req, res, next)
}

export const requireEmailVerified = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Please authenticate', constants.HTTP_STATUS.UNAUTHORIZED))
  }

  next()
}