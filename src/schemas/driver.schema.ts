import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateDriverSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
