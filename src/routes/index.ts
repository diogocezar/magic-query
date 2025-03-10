import { Router } from "express";
import queryRouter from "./query.routes";
import driverRouter from "./driver.routes";
import deviceRouter from "./device.routes";

const router = Router();

router.use("/query", queryRouter);
router.use("/drivers", driverRouter);
router.use("/devices", deviceRouter);

export default router;
