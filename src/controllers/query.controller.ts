import { Request, Response } from "express";
import { QueryService } from "../services/query.service";
import { logger } from "../config/logger";
import { QueryInput } from "../schemas/query.schema";

export class QueryController {
  private queryService: QueryService;

  constructor() {
    this.queryService = new QueryService();
  }

  processQuery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body as QueryInput;

      logger.info({ query }, "Processing natural language query");

      // Gerar a consulta SQL a partir da linguagem natural
      const sqlQuery = await this.queryService.generateSqlQuery(query);

      // Executar a consulta SQL
      const result = await this.queryService.executeQuery(sqlQuery);

      logger.info(
        {
          query,
          sqlQuery,
          rowCount: result.data.length,
        },
        "Query processed successfully"
      );

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Error processing query");

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      res.status(500).json({
        status: "error",
        message: errorMessage,
      });
    }
  };
}
