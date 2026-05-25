# Frontend - Verificador de Ping

## Estrutura profissional aplicada

- `app/`: composicao principal
- `modules/`: organizacao por dominio (`devices`, `dashboard`, `groups`, `alerts`)
- `shared/`: componentes e infraestrutura comum (`api`)
- `styles/`: estilos globais e por componente/view

## Melhorias aplicadas

- Estado centralizado com Pinia (`devices.store`).
- Camada de API central (`shared/api/client`) com timeout e erro padrao.
- Organizacao por dominio para facilitar escalabilidade.
- Polling com awareness de visibilidade de aba.
- Scripts de qualidade (`lint`, `test`) e base inicial de testes.
- `.env.example` com `VITE_API_BASE_URL`.
