# Verificador de Ping

Projeto fullstack para monitoramento de disponibilidade de dispositivos de rede, com frontend no Vercel e backend no Render, usando MongoDB Atlas como persistencia.

## Tecnologias

- Frontend: Vue 3, Vite, Pinia, Axios
- Backend: Node.js, Express 5, Mongoose, ping, Axios
- Banco: MongoDB Atlas

## Como instalar

```bash
npm --prefix Backend install
npm --prefix Frontend install
```

## Como rodar

```bash
npm run dev:backend
npm run dev:frontend
```

## Variaveis de ambiente

Backend (`Backend/.env`):

```env
DEV_PORT=3000
WEBAPP_PORT=3004
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=ping_monitor
PING_TIMEOUT_SECONDS=2
MONITORING_INTERVAL_MS=60000
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Frontend (`Frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Endpoints

- `GET /health`
- `GET /devices`
- `POST /devices`
- `PUT /devices/:id`
- `POST /devices/bulk-delete`
- `GET /events`

## Estrutura

```text
Backend/src
|- app/
|- config/
|- constants/
|- controllers/
|- database/
|  |- connection.js
|  `- models/
|- errors/
|- middlewares/
|- repositories/
|- routes/
|- services/
`- validators/
```

## Deploy (Vercel + Render + Atlas)

1. MongoDB Atlas: criar cluster, usuario e liberar IP do Render.
2. Render (backend): configurar `MONGO_URI`, `MONGO_DB_NAME` e demais envs.
3. Vercel (frontend): configurar `VITE_API_BASE_URL` com URL publica do Render.
4. Backend: habilitar CORS para o dominio do frontend em producao (proximo passo recomendado).

## Proximas melhorias

- Adicionar whitelist de CORS por ambiente.
- Adicionar migracao automatica JSON -> Mongo para carga inicial.
- Adicionar testes de integracao da API com Mongo em CI.
