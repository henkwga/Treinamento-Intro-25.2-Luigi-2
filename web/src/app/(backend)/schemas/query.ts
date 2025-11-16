import { z } from "zod";

export const productsQuerySchema = z.object({
  category: z.string().trim().transform(v => v.toLowerCase()).optional(),
  ids: z
    .string()
    .transform(v =>
      v
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)
    )
    .optional(),
});
export type ProductsQuery = z.infer<typeof productsQuerySchema>;
