import { createOllama } from "ollama-ai-provider";
import { generateText } from "ai";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { dbAsync } from "../database/connection";
import { QueryResult } from "../types/database";
import { processSqlResponse, isSelectQuery } from "../utils/sql-cleaner";
import {
  getSqlGenerationSystemPrompt,
  generateEnhancedPrompt,
} from "../utils/prompts";

export class QueryService {
  private ollama;

  constructor() {
    const baseURL = env.OLLAMA_API_URL;
    logger.info({ baseURL }, "Initializing Ollama client with baseURL");
    this.ollama = createOllama({
      baseURL: baseURL,
    });
  }

  async generateSqlQuery(userQuery: string): Promise<string> {
    try {
      logger.info({ userQuery }, "Generating SQL query from natural language");
      const modelName = "deepseek-r1:8b"; // Ou outro modelo que você tenha instalado

      logger.info({ model: modelName }, "Using model for query generation");

      // Obter os prompts do arquivo de prompts
      const systemPrompt = getSqlGenerationSystemPrompt();
      const enhancedPrompt = generateEnhancedPrompt(userQuery);

      // Chamar o modelo para gerar a consulta SQL
      const result = await generateText({
        model: this.ollama(modelName),
        system: systemPrompt,
        prompt: enhancedPrompt,
        temperature: 0.1, // Baixa temperatura para respostas mais determinísticas
      });

      // Utilizar a função de processamento de SQL do utilitário
      const sqlQuery = processSqlResponse(result.text);

      logger.info(
        { extractedQuery: sqlQuery },
        "Extracted SQL query from model response"
      );

      // Verificar se a consulta contém apenas SELECT
      if (!isSelectQuery(sqlQuery)) {
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
      if (!isSelectQuery(sqlQuery)) {
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
}
