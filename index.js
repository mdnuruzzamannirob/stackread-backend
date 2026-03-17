const app = require('./src/app')
const { connect } = require('./src/config/db')
const env = require('./src/config/env')

const start = async () => {
  await connect()
  app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`)
    console.log(`Base URL: http://localhost:${env.PORT}/api/v1`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
