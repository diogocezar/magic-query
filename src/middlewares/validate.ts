import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { logger } from "../config/logger";

// Definindo um tipo personalizado para o middleware que pode retornar uma resposta ou chamar next()
type ValidateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any>>;

export const validate = (schema: AnyZodObject): ValidateMiddleware => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar apenas o corpo da requisição
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn(
          {
            path: req.path,
            method: req.method,
            validation: error.format(),
          },
          "Validation error"
        );

        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      logger.error({ error }, "Unexpected error in validation middleware");
      return res.status(500).json({
        status: "error",
        message: "Internal server error during validation",
      });
    }
  };
};
