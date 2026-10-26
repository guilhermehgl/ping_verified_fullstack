# Frontend — Ping Verified

Vue 3, Vite e Pinia, com módulos devices/dashboard/groups/alerts e componentes/estilos compartilhados.

`npm ci` · `npm run dev` · `npm test` · `npm run lint` · `npm run build`.

O padrão é uma demonstração em memória, sem API, persistência remota ou sondagens. Recarregar restaura os exemplos. Não existe chave de MongoDB ou Telegram no navegador.

Para monitoramento autorizado no próprio computador, crie .env.local conforme .env.example: VITE_APP_MODE=local e VITE_API_BASE_URL=http://127.0.0.1:3000. O modo real só é aceito em hostname loopback e exige API HTTP também em loopback. Um domínio público continua usando a simulação mesmo se VITE_APP_MODE for definido incorretamente como local.

Dashboard/Grupos e identidade visual preservados, com seleção exata por ID string e estados distintos de carregamento, erro e vazio. Os testes incluem componentes com ObjectIds, CRUD fictício sem HTTP e recuperação após falha.

[Instruções e limites](../README.md).
