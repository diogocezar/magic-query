import { extractTableDefinitions } from "./schema-loader";

/**
 * Obtém o prompt do sistema para geração de consultas SQL
 * @returns O prompt do sistema formatado com o schema do banco de dados
 */
export function getSqlGenerationSystemPrompt(): string {
  const dbSchema = extractTableDefinitions();

  return `
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
${dbSchema}
`;
}

/**
 * Gera um prompt aprimorado para a consulta do usuário
 * @param userQuery A consulta em linguagem natural do usuário
 * @returns O prompt formatado para o modelo
 */
export function generateEnhancedPrompt(userQuery: string): string {
  const dbSchema = extractTableDefinitions();

  return `
Baseado no seguinte schema de banco de dados:

${dbSchema}

Gere uma consulta SQL para responder à seguinte pergunta: "${userQuery}"

Lembre-se:
- Gere APENAS a consulta SQL, sem explicações
- Use apenas comandos SELECT (nunca INSERT, UPDATE, DELETE)
- Não use funções específicas que não sejam suportadas pelo SQLite
`;
}
