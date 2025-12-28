"use server";

import {
  findProductById,
  findProductBy,
  updateProduct,
} from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";
import type { UpdateProductInput } from "@/lib/db/schema";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  categoryId: z.string().uuid("Categoria inválida").optional(),
  description: z.string().optional().nullable(),
  costPrice: z
    .number()
    .min(0, "Preço de custo deve ser maior ou igual a zero")
    .optional(),
  salePrice: z
    .number()
    .min(0, "Preço de venda deve ser maior ou igual a zero")
    .optional(),
  stockQuantity: z
    .number()
    .int()
    .min(0, "Quantidade em estoque deve ser maior ou igual a zero")
    .optional(),
});

export async function updateProductAction(
  id: string,
  data: UpdateProductInput
) {
  const userId = await verifyAuth();
  const validation = updateProductSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(validation.error.errors[0]?.message || "Dados inválidos");
  }

  // Verificar se o produto existe e pertence ao usuário
  const existing = await findProductById(id, userId);
  if (!existing) {
    throw new Error("Produto não encontrado");
  }

  const product = await updateProduct(id, validation.data, userId);
  return product;
}
