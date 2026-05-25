export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500
  const payload = {
    error: error.message || 'Erro interno do servidor'
  }

  if (error.details) {
    payload.details = error.details
  }

  if (statusCode >= 500) {
    console.error('Erro nao tratado:', error)
  }

  res.status(statusCode).json(payload)
}
