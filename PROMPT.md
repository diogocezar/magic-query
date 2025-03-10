# MagicQuery 🪄 - AI-Powered SQL Queries

## 🏗️ Objetivo
Criar um sistema demonstrativo de IA para gerar consultas SQL a partir de linguagem natural.

## 🔧 Tecnologias
- Express.js
- Node.js
- AI SDK (Vercel)
- SQLite
- Zod
- Ollama

## 🗂️ Estrutura do Banco de Dados

```sql
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(50),
    vehicle_plate VARCHAR(10),
    driver_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    device_id INT NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    speed DECIMAL(6, 2),
    direction SMALLINT,
    collected_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);
```

## 🚀 Implementação Base

- Configurar SQLite e criar estrutura do banco.
- Criar arquivos de seed para popular dados de teste.
- Implementar sistema de migrations.
- Criar endpoints CRUD.

## 🎯 Implementação Principal

- Criar um endpoint `POST /query`:
  - Receber mensagem do usuário.
  - Utilizar AI SDK da Vercel para gerar a consulta SQL.
  - Garantir que apenas SELECTs sejam gerados.
  - Informar a estrutura do banco para a IA.

## 📌 Regras Gerais

- Código em inglês.
- Criar logs detalhados.
- Criar testes via .http (salvar em test/).
- Organização: controllers, services, routes.
- Validar entradas da API (zod).
- Documentação em README.md.
- Utilizar TypeScript.
- Gerenciar dependências com PNPM.
- Manter todo o código dentro de src/.
- Arquivo principal: server.ts.
- Utilize a documentação do `https://sdk.vercel.ai/` para a implementação do AI SDK.

## 🧠 Integração com AI SDK

- Utilizar Vercel AI SDK: Documentação.
- Modelo: Ollama.
- Configurar o SDK para:
  - Interpretar a mensagem do usuário.
  - Gerar a consulta SQL correta.
  - Executar a consulta e retornar a resposta.