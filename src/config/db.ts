import mongoose from 'mongoose'
import dns from 'node:dns'

import { config } from './index'
import { logger } from './logger'

export const connectToDatabase = async (): Promise<void> => {
  if (config.mongodbDnsServers.length > 0) {
    dns.setServers(config.mongodbDnsServers)
    logger.info('MongoDB DNS servers configured', {
      servers: config.mongodbDnsServers,
    })
  }

  await mongoose.connect(config.mongodbUri)
  logger.info('MongoDB connection established', {
    database: mongoose.connection.name,
    host: mongoose.connection.host,
  })
}

export const disconnectFromDatabase = async (): Promise<void> => {
  await mongoose.disconnect()
  logger.info('MongoDB connection closed')
}

export const getDatabaseState = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }

  return states[mongoose.connection.readyState] ?? 'unknown'
}
