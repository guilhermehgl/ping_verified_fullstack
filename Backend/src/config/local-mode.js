// Real monitoring is an explicit local command, never an environment toggle.
export function assertLocalRuntime() {
  if (process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL) {
    throw new Error('Monitoramento real permitido somente em execução local confiável')
  }
}

export function localRequestsOnly(req, res, next) {
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(req.hostname)) {
    return res.status(403).json({ error: 'Acesso restrito ao próprio computador' })
  }
  next()
}
