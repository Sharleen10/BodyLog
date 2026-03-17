import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import prisma from './database'

interface JwtPayload {
  id: string
  email: string
  name: string
  iat?: number
  exp?: number
}

// JWT Strategy
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
}

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
        },
      })

      if (user) {
        return done(null, user)
      }
      return done(null, false)
    } catch (error) {
      return done(error, false)
    }
  })
)

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: profile.emails?.[0]?.value },
                { providerId: profile.id, provider: 'google' }
              ]
            }
          })

          if (!user) {
            // Create new user
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0]?.value!,
                name: profile.displayName,
                image: profile.photos?.[0]?.value,
                provider: 'google',
                providerId: profile.id,
                emailVerified: true,
              }
            })
          }

          return done(null, user)
        } catch (error) {
          return done(error as Error, undefined)
        }
      }
    )
  )
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
        profileFields: ['id', 'emails', 'name', 'photos'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: profile.emails?.[0]?.value },
                { providerId: profile.id, provider: 'facebook' }
              ]
            }
          })

          if (!user) {
            // Create new user
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0]?.value!,
                name: `${profile.name?.givenName} ${profile.name?.familyName}`,
                image: profile.photos?.[0]?.value,
                provider: 'facebook',
                providerId: profile.id,
                emailVerified: true,
              }
            })
          }

          return done(null, user)
        } catch (error) {
          return done(error as Error, undefined)
        }
      }
    )
  )
}

export default passport