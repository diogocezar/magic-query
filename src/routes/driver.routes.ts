import { Router } from "express";
import { DriverController } from "../controllers/driver.controller";
import { validate } from "../middlewares/validate";
import {
  createDriverSchema,
  updateDriverSchema,
} from "../schemas/driver.schema";

const driverRouter = Router();
const driverController = new DriverController();

driverRouter.get("/", driverController.getAll);
driverRouter.get("/:id", driverController.getById);
driverRouter.post(
  "/",
  // @ts-ignore - Ignorando erro de tipagem do middleware
  validate(createDriverSchema),
  driverController.create
);
driverRouter.put(
  "/:id",
  // @ts-ignore - Ignorando erro de tipagem do middleware
  validate(updateDriverSchema),
  driverController.update
);
driverRouter.delete("/:id", driverController.delete);

export default driverRouter;
