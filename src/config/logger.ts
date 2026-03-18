import fs from 'node:fs'
import path from 'node:path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

import { config } from './index'

const logDirectory = path.resolve(process.cwd(), config.logDir)

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true })
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    const meta =
      Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : ''
    const output = stack ?? message

    return `${timestamp} [${level}] ${output}${meta}`
  }),
)

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    const meta =
      Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : ''
    return `${timestamp} ${level}: ${stack ?? message}${meta}`
  }),
)

export const logger = winston.createLogger({
  level: config.logLevel,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  format: logFormat,
  defaultMeta: { service: 'lms-backend' },
  transports: [
    new winston.transports.Console({
      format: config.isProduction ? logFormat : consoleFormat,
    }),
    new DailyRotateFile({
      dirname: logDirectory,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: config.logRotation.appMaxFiles,
      maxSize: config.logRotation.maxSize,
      zippedArchive: config.logRotation.zippedArchive,
      level: 'info',
    }),
    new DailyRotateFile({
      dirname: logDirectory,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: config.logRotation.errorMaxFiles,
      maxSize: config.logRotation.maxSize,
      zippedArchive: config.logRotation.zippedArchive,
      level: 'error',
    }),
  ],
})

export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}
