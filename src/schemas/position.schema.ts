import { z } from "zod";

export const createPositionSchema = z.object({
  device_id: z.number().int().positive("Device ID is required"),
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
  speed: z.number().nullable().optional(),
  direction: z.number().int().min(0).max(359).nullable().optional(),
  collected_at: z.string().datetime("Invalid datetime format"),
});

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
