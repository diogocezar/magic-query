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
3. Retorne apenas a consulta SQL, sem explicações adicionais.
4. Sempre verifique se as tabelas e colunas referenciadas existem no schema fornecido.
5. Use aliases para tornar a consulta mais legível quando necessário.
6. Inclua comentários SQL para explicar partes complexas da consulta.

Aqui está o schema do banco de dados:
${DB_SCHEMA}
`;

export class QueryService {
  private ollama;

  constructor() {
    // Extrair apenas o host e porta da URL
    const baseURL = env.OLLAMA_API_URL.replace("/api/generate", "");

    this.ollama = createOllama({
      baseURL: baseURL + "/api",
    });
  }

  async generateSqlQuery(userQuery: string): Promise<string> {
    try {
      logger.info({ userQuery }, "Generating SQL query from natural language");

      const { text } = await generateText({
        model: this.ollama("llama3"),
        system: SYSTEM_PROMPT,
        prompt: userQuery,
        temperature: 0.1, // Baixa temperatura para respostas mais determinísticas
      });

      const sqlQuery = text.trim();

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
    const normalizedQuery = query.trim().toLowerCase();
    return (
      normalizedQuery.startsWith("select") &&
      !normalizedQuery.includes("insert") &&
      !normalizedQuery.includes("update") &&
      !normalizedQuery.includes("delete") &&
      !normalizedQuery.includes("drop") &&
      !normalizedQuery.includes("alter") &&
      !normalizedQuery.includes("create")
    );
  }
}
