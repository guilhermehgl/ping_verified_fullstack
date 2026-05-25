# Backend - Ping Verified

API Node.js/Express responsável por cadastro de dispositivos, histórico de eventos e monitoramento.

## Stack

- Node.js
- Express 5
- Mongoose
- MongoDB Atlas

## Arquitetura

- `src/routes`: rotas HTTP
- `src/controllers`: camada de entrada/saída
- `src/services`: regras de negócio
- `src/repositories`: acesso a dados
- `src/middlewares`: erro global e 404
- `src/config`: variáveis de ambiente

## Variáveis de Ambiente

Use `Backend/.env.example` como base para `Backend/.env`.

Campos principais:

- `NODE_ENV`
- `PORT`
- `DEV_PORT`
- `ALLOWED_ORIGINS`
- `MONGO_URI`
- `MONGO_DB_NAME`
- `PING_TIMEOUT_SECONDS`
- `MONITORING_INTERVAL_MS`
- `MONITOR_METHOD` (`auto`, `icmp`, `tcp`)
- `MONITOR_TCP_PORT`

## Scripts

- `npm run dev`: desenvolvimento com nodemon
- `npm run start`: execução padrão
- `npm run start:packaged`: execução para modo webapp
- `npm run build:frontend`: build do frontend
- `npm run webapp`: build frontend + start empacotado
- `npm run check`: valida sintaxe do entrypoint

## Endpoints

- `GET /health`
- `GET /devices`
- `POST /devices`
- `PUT /devices/:id`
- `POST /devices/bulk-delete`
- `GET /events`

## Observação sobre Monitoramento em Cloud

Em provedores como Render, o monitoramento de dispositivos de rede local (LAN) pode não funcionar via ICMP por restrição de ambiente e isolamento de rede.
