const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const User = require('../models/User')
const env = require('./env')

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
}

passport.use(
  'user-jwt',
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      if (payload.type !== 'user') return done(null, false)

      const user = await User.findById(payload.id).select(
        '-password_hash -google_id -facebook_id',
      )

      if (!user) return done(null, false)
      if (user.status !== 'active') return done(null, false)

      // Invalidate JWTs issued before logout (token_version check)
      if (user.token_version !== payload.tv) return done(null, false)

      return done(null, user)
    } catch (err) {
      return done(err, false)
    }
  }),
)

module.exports = passport
