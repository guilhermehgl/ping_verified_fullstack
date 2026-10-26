export function errorHandler(error, req, res, next) {
  const statusCode = error.code === 11000 ? 409 :
    ['CastError', 'ValidationError'].includes(error.name) ? 400 : error.statusCode || error.status || 500
  const payload = {
    error: statusCode === 409 ? 'Dispositivo já cadastrado nesse grupo' :
      statusCode >= 500 ? 'Erro interno do servidor' : error.message
  }

  if (statusCode < 500 && error.details) {
    payload.details = error.details
  }

  if (statusCode >= 500) {
    console.error('Erro interno na requisição', req.method, req.path)
  }

  res.status(statusCode).json(payload)
}
