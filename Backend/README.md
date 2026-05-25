# Backend - Verificador de Ping

API responsável pelo monitoramento de dispositivos e exposição dos dados para o frontend.

## Arquitetura

- `routes`: definição de endpoints
- `controllers`: camada HTTP
- `services`: regras de negócio
- `repositories`: acesso a dados
- `middlewares`: tratamento global de erros e 404
- `validators`: validação/normalização de entrada
- `config`: variáveis de ambiente

## Scripts

- `npm run dev`: desenvolvimento com nodemon
- `npm run start`: execução padrão
- `npm run start:packaged`: execução para modo webapp
- `npm run build:frontend`: build do frontend
- `npm run webapp`: build frontend + start empacotado
- `npm run check`: valida sintaxe do entrypoint

## Ambiente

Use `Backend/.env.example` como base para `Backend/.env`.
