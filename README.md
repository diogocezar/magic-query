# Magic Query

Um serviço de API que utiliza modelos de IA para converter perguntas em linguagem natural em consultas SQL válidas.

## Funcionalidades

- Conversão de linguagem natural para consultas SQL
- Execução segura de consultas SQL (apenas SELECT)
- Validação de entrada com Zod
- Logs detalhados para monitoramento

## Tecnologias

- TypeScript
- Node.js
- Express
- SQLite
- Ollama (para modelos de IA locais)
- Zod (validação)
- Pino (logging)

## Estrutura do Projeto

```
magic-query/
├── src/
│   ├── config/         # Configurações do aplicativo
│   ├── controllers/    # Controladores da API
│   ├── database/       # Conexão e migrações do banco de dados
│   ├── middlewares/    # Middlewares Express
│   ├── routes/         # Rotas da API
│   ├── schemas/        # Schemas de validação Zod
│   ├── services/       # Lógica de negócios
│   ├── types/          # Definições de tipos TypeScript
│   ├── utils/          # Funções utilitárias
│   └── server.ts       # Ponto de entrada do aplicativo
├── test/               # Arquivos de teste HTTP
└── package.json        # Dependências e scripts
```

## Pré-requisitos

- Node.js 18+
- PNPM
- Ollama instalado e configurado

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/magic-query.git
   cd magic-query
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações.

4. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   ```

## Uso da API

### Gerar uma consulta SQL a partir de linguagem natural

```http
POST /api/query/generate
Content-Type: application/json

{
  "query": "Quais são os 5 dispositivos mais recentes?"
}
```

### Executar uma consulta SQL

```http
POST /api/query/execute
Content-Type: application/json

{
  "sql": "SELECT * FROM devices ORDER BY created_at DESC LIMIT 5"
}
```

## Segurança

- Apenas consultas SELECT são permitidas
- Validação rigorosa de entrada
- Verificação de palavras-chave proibidas

## Testes

Execute os testes HTTP usando uma ferramenta como o REST Client para VS Code ou Insomnia:

```bash
# Os arquivos de teste estão em:
test/api.http
test/sql-cleaner.http
```

## Licença

MIT
