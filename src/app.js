require('./config/env') // Validate env vars before anything else
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const passport = require('./config/passport')
const errorHandler = require('./middleware/errorHandler')
const routes = require('./routes')
const env = require('./config/env')

const app = express()

// ─── Security & Request Parsing ───────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ─── Logging ──────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ─── Passport ────────────────────────────────────────────────────────────────
app.use(passport.initialize())

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', routes)

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Cannot ${req.method} ${req.path}` })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler)

module.exports = app
