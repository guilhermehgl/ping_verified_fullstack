import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  devPort: toNumber(process.env.DEV_PORT, 3000),
  webappPort: toNumber(process.env.WEBAPP_PORT, 3004),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'https://ping-verified-fullstack.vercel.app,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGO_URI || '',
  mongoDbName: process.env.MONGO_DB_NAME || 'ping_monitor',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  pingTimeoutSeconds: toNumber(process.env.PING_TIMEOUT_SECONDS, 2),
  monitoringIntervalMs: toNumber(process.env.MONITORING_INTERVAL_MS, 60000),
  monitorMethod: (process.env.MONITOR_METHOD || 'auto').toLowerCase(),
  monitorTcpPort: toNumber(process.env.MONITOR_TCP_PORT, 80)
}
