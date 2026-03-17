const mongoose = require('mongoose')
const env = require('./env')

const connect = async () => {
  await mongoose.connect(env.MONGODB_URI)
  console.log(`MongoDB connected: ${mongoose.connection.host}`)
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message)
})

module.exports = { connect }
