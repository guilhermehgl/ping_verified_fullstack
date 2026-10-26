import { expect, it, vi } from 'vitest'
const d=vi.hoisted(()=>({post:vi.fn(),create:vi.fn(),env:{telegramBotToken:'',telegramChatId:''}}))
vi.mock('axios',()=>({default:{create:d.create.mockReturnValue({post:d.post})}}))
vi.mock('../src/config/env.js',()=>({env:d.env}))
import { sendTelegram } from '../src/services/notification.service.js'
it('skips missing credentials and bounds configured requests to five seconds',async()=>{
  await sendTelegram('mock');expect(d.post).not.toHaveBeenCalled()
  expect(d.create).toHaveBeenCalledWith(expect.objectContaining({timeout:5000}))
  d.env.telegramBotToken='test-only';d.env.telegramChatId='test-only'
  d.post.mockRejectedValue(new Error('timeout'))
  const log=vi.spyOn(console,'error').mockImplementation(()=>{})
  await expect(sendTelegram('mock')).resolves.toBeUndefined();expect(d.post).toHaveBeenCalledOnce();expect(d.post).toHaveBeenCalledWith('/sendMessage',expect.any(Object),{signal:expect.any(AbortSignal)})
  log.mockRestore()
})
