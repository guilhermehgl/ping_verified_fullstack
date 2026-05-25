import axios from 'axios'
import { env } from '../config/env.js'

const api = axios.create({
  baseURL: `https://api.telegram.org/bot${env.telegramBotToken}`
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
    })
  } catch (error) {
    console.error('Erro ao enviar Telegram:', error.message)
  }
}
