# Backend — Ping Verified

Express 5 + Mongoose, organizado em routes/controllers/services/repositories.

- `npm ci`: instalação reproduzível.
- `npm start`: processo público restrito, sem banco/monitoramento. /devices e /events respondem 403.
- `npm run dev` ou `npm run start:local`: monitoramento autorizado em ambiente não produtivo/não hospedado, somente em 127.0.0.1.
- `npm test`: testes isolados. `npm run check`: sintaxe de todos os arquivos src, sem iniciar a aplicação.

Configure .env.example somente para o modo local. MONGO_URI e MONGO_DB_NAME apontam para um banco próprio. ALLOWED_ORIGINS permite os frontends locais. MONITOR_METHOD aceita auto/icmp/tcp; MONITOR_TCP_PORT indica a porta TCP verificada. PING_TIMEOUT_SECONDS e MONITORING_INTERVAL_MS controlam espera e intervalo. TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID são opcionais e nunca devem ir para o Git.

A primeira leitura estabelece o estado. Depois são exigidas três falhas para queda e dois sucessos para recuperação. Eventos registram transições; falha de persistência não bloqueia o estado e não possui reenvio automático. Telegram tem timeout de cinco segundos. Não exponha o modo local por túnel ou proxy.

[Endpoints, decisões e execução](../README.md).
