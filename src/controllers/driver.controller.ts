import { Request, Response } from "express";
import { dbAsync } from "../database/connection";
import { logger } from "../config/logger";
import { CreateDriverInput, UpdateDriverInput } from "../schemas/driver.schema";

export class DriverController {
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const drivers = await dbAsync.all(
        "SELECT * FROM drivers ORDER BY id",
        []
      );

      logger.info({ count: drivers.length }, "Retrieved all drivers");

      res.status(200).json({
        status: "success",
        data: drivers,
      });
    } catch (error) {
      logger.error({ error }, "Error retrieving drivers");
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve drivers",
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const driver = await dbAsync.get(
        "SELECT * FROM drivers WHERE id = ?",
        id
      );

      if (!driver) {
        logger.warn({ id }, "Driver not found");
        res.status(404).json({
          status: "error",
          message: "Driver not found",
        });
        return;
      }

      logger.info({ id }, "Retrieved driver by ID");

      res.status(200).json({
        status: "success",
        data: driver,
      });
    } catch (error) {
      logger.error({ error, params: req.params }, "Error retrieving driver");
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve driver",
      });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.body as CreateDriverInput;

      const result = await dbAsync.run(
        "INSERT INTO drivers (name) VALUES (?)",
        name
      );

      logger.info({ name, id: result.lastID }, "Driver created");

      res.status(201).json({
        status: "success",
        data: {
          id: result.lastID,
          name,
        },
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Error creating driver");
      res.status(500).json({
        status: "error",
        message: "Failed to create driver",
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body as UpdateDriverInput;

      const driver = await dbAsync.get(
        "SELECT * FROM drivers WHERE id = ?",
        id
      );

      if (!driver) {
        logger.warn({ id }, "Driver not found for update");
        res.status(404).json({
          status: "error",
          message: "Driver not found",
        });
        return;
      }

      await dbAsync.run("UPDATE drivers SET name = ? WHERE id = ?", [name, id]);

      logger.info({ id, name }, "Driver updated");

      res.status(200).json({
        status: "success",
        data: {
          id: Number(id),
          name,
        },
      });
    } catch (error) {
      logger.error(
        { error, params: req.params, body: req.body },
        "Error updating driver"
      );
      res.status(500).json({
        status: "error",
        message: "Failed to update driver",
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const driver = await dbAsync.get(
        "SELECT * FROM drivers WHERE id = ?",
        id
      );

      if (!driver) {
        logger.warn({ id }, "Driver not found for deletion");
        res.status(404).json({
          status: "error",
          message: "Driver not found",
        });
        return;
      }

      await dbAsync.run("DELETE FROM drivers WHERE id = ?", id);

      logger.info({ id }, "Driver deleted");

      res.status(200).json({
        status: "success",
        message: "Driver deleted successfully",
      });
    } catch (error) {
      logger.error({ error, params: req.params }, "Error deleting driver");
      res.status(500).json({
        status: "error",
        message: "Failed to delete driver",
      });
    }
  };
}
