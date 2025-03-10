import { createOllama } from "ollama-ai-provider";
import { generateText } from "ai";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { dbAsync } from "../database/connection";
import { QueryResult } from "../types/database";

// Definir o schema do banco de dados para informar a IA
const DB_SCHEMA = `
CREATE TABLE drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT UNIQUE NOT NULL,
    model TEXT,
    vehicle_plate TEXT,
    driver_id INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    speed REAL,
    direction INTEGER,
    collected_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);
`;

// Prompt para a IA
const SYSTEM_PROMPT = `
Você é um assistente especializado em gerar consultas SQL para um banco de dados SQLite.
Sua tarefa é converter perguntas em linguagem natural para consultas SQL válidas.

REGRAS IMPORTANTES:
1. Gere APENAS consultas SELECT. Nunca gere INSERT, UPDATE, DELETE ou qualquer outra operação que modifique dados.
2. Não use funções ou sintaxes específicas que não sejam suportadas pelo SQLite.
3. Retorne APENAS a consulta SQL, sem explicações adicionais, sem comentários e sem formatação markdown.
4. Não inclua texto como "Aqui está a consulta SQL:" ou qualquer outro texto introdutório.
5. Não inclua seu processo de pensamento ou raciocínio.
6. Sempre verifique se as tabelas e colunas referenciadas existem no schema fornecido.
7. Use aliases para tornar a consulta mais legível quando necessário.

Aqui está o schema do banco de dados:
${DB_SCHEMA}
`;

export class QueryService {
  private ollama;

  constructor() {
    // Usar a URL diretamente do arquivo .env
    const baseURL = env.OLLAMA_API_URL;

    logger.info({ baseURL }, "Initializing Ollama client with baseURL");

    this.ollama = createOllama({
      baseURL: baseURL,
    });
  }

  async generateSqlQuery(userQuery: string): Promise<string> {
    try {
      logger.info({ userQuery }, "Generating SQL query from natural language");

      // Usar um modelo que sabemos que existe no Ollama
      const modelName = "llama2"; // Ou outro modelo que você tenha instalado

      logger.info({ model: modelName }, "Using model for query generation");

      const { text } = await generateText({
        model: this.ollama(modelName),
        system: SYSTEM_PROMPT,
        prompt: userQuery,
        temperature: 0.1, // Baixa temperatura para respostas mais determinísticas
      });

      // Extrair apenas a consulta SQL da resposta
      let sqlQuery = text.trim();

      // Remover blocos de código markdown se presentes
      sqlQuery = sqlQuery.replace(/```sql\n/g, "").replace(/```/g, "");

      // Remover qualquer texto antes de SELECT
      const selectIndex = sqlQuery.toLowerCase().indexOf("select");
      if (selectIndex >= 0) {
        sqlQuery = sqlQuery.substring(selectIndex);
      }

      // Remover qualquer texto após o ponto e vírgula final
      const lastSemicolonIndex = sqlQuery.lastIndexOf(";");
      if (lastSemicolonIndex >= 0) {
        sqlQuery = sqlQuery.substring(0, lastSemicolonIndex + 1);
      }

      // Remover comentários SQL
      sqlQuery = sqlQuery.replace(/--.*$/gm, "").trim();

      logger.info(
        { originalResponse: text, extractedQuery: sqlQuery },
        "Extracted SQL query from model response"
      );

      // Verificar se a consulta contém apenas SELECT
      if (!this.isSelectQuery(sqlQuery)) {
        logger.warn({ sqlQuery }, "Generated query is not a SELECT statement");
        throw new Error("Only SELECT queries are allowed for security reasons");
      }

      logger.info({ sqlQuery }, "Successfully generated SQL query");
      return sqlQuery;
    } catch (error) {
      logger.error({ error }, "Failed to generate SQL query");
      throw error;
    }
  }

  async executeQuery(sqlQuery: string): Promise<QueryResult> {
    try {
      logger.info({ sqlQuery }, "Executing SQL query");

      // Verificar novamente se é uma consulta SELECT
      if (!this.isSelectQuery(sqlQuery)) {
        logger.warn({ sqlQuery }, "Attempted to execute non-SELECT query");
        throw new Error("Only SELECT queries are allowed for security reasons");
      }

      const startTime = Date.now();
      const data = await dbAsync.all(sqlQuery, []);
      const executionTime = Date.now() - startTime;

      logger.info(
        {
          sqlQuery,
          rowCount: data.length,
          executionTime,
        },
        "Query executed successfully"
      );

      return {
        sql: sqlQuery,
        data,
        executionTime,
      };
    } catch (error) {
      logger.error({ error, sqlQuery }, "Failed to execute SQL query");
      throw error;
    }
  }

  private isSelectQuery(query: string): boolean {
    // Verificar se a consulta está vazia
    if (!query || query.trim() === "") {
      return false;
    }

    // Normalizar a consulta para facilitar a verificação
    const normalizedQuery = query.trim().toLowerCase();

    // Verificar se a consulta começa com SELECT
    if (!normalizedQuery.startsWith("select")) {
      return false;
    }

    // Lista de palavras-chave proibidas que podem modificar dados
    const forbiddenKeywords = [
      "insert into",
      "update ",
      "delete from",
      "drop table",
      "drop database",
      "truncate table",
      "alter table",
      "create table",
      "create database",
    ];

    // Verificar se a consulta contém alguma das palavras-chave proibidas
    // Usamos espaço após algumas palavras-chave para evitar falsos positivos
    for (const keyword of forbiddenKeywords) {
      if (normalizedQuery.includes(keyword)) {
        return false;
      }
    }

    // Se passou por todas as verificações, é uma consulta SELECT válida
    return true;
  }
}
