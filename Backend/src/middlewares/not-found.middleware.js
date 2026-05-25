import { AppError } from '../errors/app-error.js'

export function notFoundHandler(req, res, next) {
  next(new AppError(`Rota nao encontrada: ${req.method} ${req.originalUrl}`, 404))
}
