import { z } from "zod";

export const productCategorySchema = z.object({
  id: z.string(),
  nome: z.string(),
  slug: z.string(),
});

export const productRelCategorySchema = z.object({
  categoria: productCategorySchema,
});

export const productCreateSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "Descrição muito curta").optional().nullable(),
  preco: z.coerce.number().positive("Preço deve ser positivo"),
  cover: z.string().min(1, "Imagem é obrigatória"),
  categoriaIds: z.array(z.string()).optional(),
});
export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const productPatchSchema = productCreateSchema.partial();
export type ProductPatchInput = z.infer<typeof productPatchSchema>;
