import { Router } from "express";
import { DeviceController } from "../controllers/device.controller";
import { validate } from "../middlewares/validate";
import {
  createDeviceSchema,
  updateDeviceSchema,
} from "../schemas/device.schema";

const deviceRouter = Router();
const deviceController = new DeviceController();

deviceRouter.get("/", deviceController.getAll);
deviceRouter.get("/:id", deviceController.getById);
deviceRouter.post(
  "/",
  // @ts-ignore - Ignorando erro de tipagem do middleware
  validate(createDeviceSchema),
  deviceController.create
);
deviceRouter.put(
  "/:id",
  // @ts-ignore - Ignorando erro de tipagem do middleware
  validate(updateDeviceSchema),
  deviceController.update
);
deviceRouter.delete("/:id", deviceController.delete);

export default deviceRouter;
