import { Request, Response } from "express";
import { dbAsync } from "../database/connection";
import { logger } from "../config/logger";
import { CreateDeviceInput, UpdateDeviceInput } from "../schemas/device.schema";

export class DeviceController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const devices = await dbAsync.all(
        `
        SELECT d.*, dr.name as driver_name 
        FROM devices d
        LEFT JOIN drivers dr ON d.driver_id = dr.id
        ORDER BY d.id
      `,
        []
      );

      logger.info({ count: devices.length }, "Retrieved all devices");

      res.status(200).json({
        status: "success",
        data: devices,
      });
    } catch (error) {
      logger.error({ error }, "Error retrieving devices");
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve devices",
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const device = await dbAsync.get(
        `
        SELECT d.*, dr.name as driver_name 
        FROM devices d
        LEFT JOIN drivers dr ON d.driver_id = dr.id
        WHERE d.id = ?
      `,
        id
      );

      if (!device) {
        logger.warn({ id }, "Device not found");
        res.status(404).json({
          status: "error",
          message: "Device not found",
        });
        return;
      }

      logger.info({ id }, "Retrieved device by ID");

      res.status(200).json({
        status: "success",
        data: device,
      });
    } catch (error) {
      logger.error({ error, params: req.params }, "Error retrieving device");
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve device",
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, model, vehicle_plate, driver_id } =
        req.body as CreateDeviceInput;

      const result = await dbAsync.run(
        "INSERT INTO devices (identifier, model, vehicle_plate, driver_id) VALUES (?, ?, ?, ?)",
        [identifier, model, vehicle_plate, driver_id]
      );

      logger.info({ identifier, id: result.lastID }, "Device created");

      res.status(201).json({
        status: "success",
        data: {
          id: result.lastID,
          identifier,
          model,
          vehicle_plate,
          driver_id,
        },
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Error creating device");
      res.status(500).json({
        status: "error",
        message: "Failed to create device",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateDeviceInput;

      const device = await dbAsync.get(
        "SELECT * FROM devices WHERE id = ?",
        id
      );

      if (!device) {
        logger.warn({ id }, "Device not found for update");
        res.status(404).json({
          status: "error",
          message: "Device not found",
        });
        return;
      }

      // Construir a consulta de atualização dinamicamente
      const updates: string[] = [];
      const values: any[] = [];

      if (updateData.identifier !== undefined) {
        updates.push("identifier = ?");
        values.push(updateData.identifier);
      }

      if (updateData.model !== undefined) {
        updates.push("model = ?");
        values.push(updateData.model);
      }

      if (updateData.vehicle_plate !== undefined) {
        updates.push("vehicle_plate = ?");
        values.push(updateData.vehicle_plate);
      }

      if (updateData.driver_id !== undefined) {
        updates.push("driver_id = ?");
        values.push(updateData.driver_id);
      }

      if (updates.length === 0) {
        logger.warn({ id }, "No fields to update");
        res.status(400).json({
          status: "error",
          message: "No fields to update",
        });
        return;
      }

      // Adicionar o ID ao final dos valores
      values.push(id);

      await dbAsync.run(
        `UPDATE devices SET ${updates.join(", ")} WHERE id = ?`,
        values
      );

      logger.info({ id, ...updateData }, "Device updated");

      // Buscar o dispositivo atualizado
      const updatedDevice = await dbAsync.get(
        "SELECT * FROM devices WHERE id = ?",
        id
      );

      res.status(200).json({
        status: "success",
        data: updatedDevice,
      });
    } catch (error) {
      logger.error(
        { error, params: req.params, body: req.body },
        "Error updating device"
      );
      res.status(500).json({
        status: "error",
        message: "Failed to update device",
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const device = await dbAsync.get(
        "SELECT * FROM devices WHERE id = ?",
        id
      );

      if (!device) {
        logger.warn({ id }, "Device not found for deletion");
        res.status(404).json({
          status: "error",
          message: "Device not found",
        });
        return;
      }

      await dbAsync.run("DELETE FROM devices WHERE id = ?", id);

      logger.info({ id }, "Device deleted");

      res.status(200).json({
        status: "success",
        message: "Device deleted successfully",
      });
    } catch (error) {
      logger.error({ error, params: req.params }, "Error deleting device");
      res.status(500).json({
        status: "error",
        message: "Failed to delete device",
      });
    }
  }
}
