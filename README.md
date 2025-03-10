# MagicQuery 🪄

Sistema de geração de consultas SQL a partir de linguagem natural usando IA.

## 📋 Descrição

MagicQuery é uma API que permite converter perguntas em linguagem natural para consultas SQL válidas, executá-las e retornar os resultados. O sistema utiliza o Ollama para processar a linguagem natural e gerar as consultas SQL.

## 🔧 Tecnologias

- **Backend**: Node.js, Express, TypeScript
- **Banco de Dados**: SQLite
- **IA**: Ollama (via AI SDK da Vercel)
- **Validação**: Zod
- **Logs**: Pino
- **Gerenciador de Pacotes**: PNPM

## 🗂️ Estrutura do Banco de Dados

O sistema utiliza um banco de dados SQLite com as seguintes tabelas:

- **drivers**: Armazena informações sobre motoristas
- **devices**: Armazena informações sobre dispositivos de rastreamento
- **positions**: Armazena as posições geográficas dos dispositivos

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- PNPM
- Ollama instalado e rodando localmente

### Passos para instalação

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
   Edite o arquivo `.env` conforme necessário.

4. Execute as migrações do banco de dados:
   ```bash
   pnpm migrate
   ```

5. Popule o banco de dados com dados de exemplo:
   ```bash
   pnpm seed
   ```

6. Inicie o servidor:
   ```bash
   pnpm dev
   ```

## 📚 Uso da API

### Endpoints

#### Consulta em Linguagem Natural
- **POST /api/query**
  - Corpo: `{ "query": "Quais são os 5 motoristas cadastrados no sistema?" }`
  - Resposta: Consulta SQL gerada e resultados da execução

#### Motoristas (CRUD)
- **GET /api/drivers** - Listar todos os motoristas
- **GET /api/drivers/:id** - Obter motorista por ID
- **POST /api/drivers** - Criar novo motorista
- **PUT /api/drivers/:id** - Atualizar motorista
- **DELETE /api/drivers/:id** - Excluir motorista

#### Dispositivos (CRUD)
- **GET /api/devices** - Listar todos os dispositivos
- **GET /api/devices/:id** - Obter dispositivo por ID
- **POST /api/devices** - Criar novo dispositivo
- **PUT /api/devices/:id** - Atualizar dispositivo
- **DELETE /api/devices/:id** - Excluir dispositivo

### Exemplos de Consultas

Você pode encontrar exemplos de requisições no arquivo `test/api.http`.

## 🧪 Testes

Para testar a API, você pode usar o arquivo de testes HTTP:

```bash
# Se você estiver usando o VS Code com a extensão REST Client
# Abra o arquivo test/api.http e clique em "Send Request"

# Ou use curl, Postman ou outra ferramenta de sua preferência
```

## 📝 Licença

Este projeto está licenciado sob a licença ISC.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
