import { logger } from "../config/logger";

/**
 * Remove marcações de código markdown da resposta SQL
 * @param text Texto contendo a consulta SQL possivelmente com marcações markdown
 * @returns Texto limpo sem marcações markdown
 */
export function removeMarkdownFormatting(text: string): string {
  return text
    .replace(/```sql\n/g, "")
    .replace(/```sql/g, "")
    .replace(/```\n/g, "")
    .replace(/```/g, "")
    .trim();
}

/**
 * Verifica se o texto contém uma consulta SQL válida (começando com SELECT)
 * @param text Texto a ser verificado
 * @returns Verdadeiro se o texto contém uma consulta SQL válida
 */
export function isValidSqlQuery(text: string): boolean {
  const normalizedText = text.trim().toUpperCase();
  return normalizedText.startsWith("SELECT");
}

/**
 * Verifica se uma consulta SQL é do tipo SELECT e não contém operações de modificação de dados
 * @param query Consulta SQL a ser verificada
 * @returns true se for uma consulta SELECT válida e segura, false caso contrário
 */
export function isSelectQuery(query: string): boolean {
  // Verificar se a consulta está vazia
  if (!query || query.trim() === "") {
    logger.warn("Empty query detected");
    return false;
  }

  // Verificar se a consulta começa com SELECT
  if (!isValidSqlQuery(query)) {
    logger.warn({ query }, "Query does not start with SELECT");
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
  const normalizedQuery = query.trim().toLowerCase();
  for (const keyword of forbiddenKeywords) {
    if (normalizedQuery.includes(keyword)) {
      logger.warn({ query, keyword }, "Query contains forbidden keyword");
      return false;
    }
  }

  // Se passou por todas as verificações, é uma consulta SELECT válida
  logger.debug({ query }, "Query validated as safe SELECT statement");
  return true;
}

/**
 * Extrai a consulta SQL de um texto, removendo explicações e comentários
 * @param text Texto contendo a consulta SQL e possivelmente explicações
 * @returns Consulta SQL extraída ou null se não for encontrada
 */
export function extractSqlQuery(text: string): string | null {
  // Primeiro remove formatação markdown
  const cleanText = removeMarkdownFormatting(text);

  // Tenta encontrar uma consulta SQL válida no texto
  const lines = cleanText.split("\n");

  // Procura por linhas que começam com SELECT
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.toUpperCase().startsWith("SELECT")) {
      // Encontrou o início da consulta SQL
      let sqlQuery = line;

      // Adiciona as linhas seguintes até encontrar uma linha vazia ou o fim do texto
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine === "") break;
        sqlQuery += " " + nextLine;
      }

      logger.debug(
        { extractedQuery: sqlQuery },
        "Consulta SQL extraída com sucesso"
      );
      return sqlQuery;
    }
  }

  // Se não encontrou uma consulta SQL válida, verifica se o texto inteiro é uma consulta
  if (isValidSqlQuery(cleanText)) {
    logger.debug(
      { extractedQuery: cleanText },
      "Texto completo é uma consulta SQL válida"
    );
    return cleanText;
  }

  logger.warn({ text }, "Não foi possível extrair uma consulta SQL válida");
  return null;
}

/**
 * Processa a resposta do modelo para extrair uma consulta SQL válida
 * @param modelResponse Resposta do modelo de IA
 * @returns Consulta SQL extraída ou erro se não for possível extrair
 */
export function processSqlResponse(modelResponse: string): string {
  const sqlQuery = extractSqlQuery(modelResponse);

  if (!sqlQuery) {
    throw new Error(
      "Não foi possível extrair uma consulta SQL válida da resposta do modelo"
    );
  }

  if (!isValidSqlQuery(sqlQuery)) {
    throw new Error("A consulta extraída não é uma consulta SQL SELECT válida");
  }

  return sqlQuery;
}
