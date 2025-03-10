import { z } from "zod";

export const createDeviceSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  model: z.string().nullable().optional(),
  vehicle_plate: z.string().nullable().optional(),
  driver_id: z.number().nullable().optional(),
});

export const updateDeviceSchema = z.object({
  identifier: z.string().min(1, "Identifier is required").optional(),
  model: z.string().nullable().optional(),
  vehicle_plate: z.string().nullable().optional(),
  driver_id: z.number().nullable().optional(),
});

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
