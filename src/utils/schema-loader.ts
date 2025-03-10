import fs from "fs";
import path from "path";
import { logger } from "../config/logger";

/**
 * Carrega o schema SQL do arquivo de migração
 * @returns O conteúdo do arquivo schema.sql
 */
export function loadDatabaseSchema(): string {
  try {
    const schemaPath = path.join(
      __dirname,
      "../database/migrations/schema.sql"
    );
    const schema = fs.readFileSync(schemaPath, "utf8");
    logger.debug("Database schema loaded successfully");
    return schema;
  } catch (error) {
    logger.error({ error }, "Failed to load database schema");
    throw new Error("Failed to load database schema");
  }
}

/**
 * Extrai as definições de tabelas do schema SQL
 * @returns As definições CREATE TABLE do schema
 */
export function extractTableDefinitions(): string {
  const schema = loadDatabaseSchema();

  // Extrair apenas as declarações CREATE TABLE
  const tableDefinitions =
    schema
      .split(";")
      .filter((statement) =>
        statement.trim().toUpperCase().includes("CREATE TABLE")
      )
      .map((statement) => statement.trim())
      .join(";\n\n") + ";";

  return tableDefinitions;
}
