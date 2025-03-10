import { Router } from "express";
import { QueryController } from "../controllers/query.controller";
import { validate } from "../middlewares/validate";
import { querySchema } from "../schemas/query.schema";

const queryRouter = Router();
const queryController = new QueryController();

// Usando o middleware de validação com o tipo correto
queryRouter.post(
  "/",
  // @ts-ignore - Ignorando erro de tipagem do middleware
  validate(querySchema),
  queryController.processQuery
);

export default queryRouter;
