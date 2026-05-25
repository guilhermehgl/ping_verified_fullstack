# Frontend - Ping Verified

Aplicação Vue 3 responsável pela interface de cadastro, visualização de status e eventos dos dispositivos.

## Stack

- Vue 3
- Vite
- Pinia
- Axios

## Estrutura

- `src/modules/`: organização por domínio (`devices`, `dashboard`, `groups`, `alerts`)
- `src/shared/`: infraestrutura e componentes compartilhados
- `src/styles/`: estilos globais, por componente e por view

## Configuração de Ambiente

Crie `Frontend/.env` com base no exemplo:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Para produção (Vercel), use:

```env
VITE_API_BASE_URL=https://ping-verified-fullstack.onrender.com
```

## Scripts

- `npm run dev`: sobe frontend em desenvolvimento
- `npm run build`: gera build de produção
- `npm run preview`: pré-visualiza build local
- `npm run lint`: lint do projeto
- `npm run test`: executa testes

## Observação

O frontend depende de `VITE_API_BASE_URL` para apontar para a API correta em produção.
