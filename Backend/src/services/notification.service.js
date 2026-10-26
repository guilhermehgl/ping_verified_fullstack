import axios from 'axios'
import { env } from '../config/env.js'

const api = axios.create({
  baseURL: `https://api.telegram.org/bot${env.telegramBotToken}`,
  timeout: 5000
})

export async function sendTelegram(message) {
  if (!env.telegramBotToken || !env.telegramChatId) {
    return
  }

  try {
    await api.post('/sendMessage', {
      chat_id: env.telegramChatId,
      text: message,
      parse_mode: 'HTML'
    }, { signal: AbortSignal.timeout(5000) })
  } catch (error) {
    console.error('Falha ao enviar notificação Telegram')
  }
}
