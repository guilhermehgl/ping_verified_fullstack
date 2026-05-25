import mongoose from 'mongoose'
import { env } from '../config/env.js'

export async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error('MONGO_URI nao configurado')
  }

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName
  })
}
