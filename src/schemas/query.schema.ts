import { z } from "zod";

export const querySchema = z.object({
  query: z.string().min(1, "Query is required"),
});

export type QueryInput = z.infer<typeof querySchema>;
