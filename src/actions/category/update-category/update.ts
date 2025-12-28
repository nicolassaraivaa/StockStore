"use server";

import {
  findCategoryById,
  findCategoryBy,
  updateCategory,
} from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";
import type { UpdateCategoryInput } from "@/lib/db/schema";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória").optional(),
});

export async function updateCategoryAction(
  id: string,
  data: UpdateCategoryInput
) {
  const validation = updateCategorySchema.safeParse(data);

  if (!validation.success) {
    throw new Error("Dados inválidos");
  }

  const userId = await verifyAuth();

  // Verificar se a categoria existe e pertence ao usuário
  const existing = await findCategoryById(id, userId);
  if (!existing) {
    throw new Error("Categoria não encontrada");
  }

  // Se estiver alterando o nome, verificar se não existe outra categoria com o mesmo nome para este usuário
  if (data.name && data.name !== existing.name) {
    const nameExists = await findCategoryBy({ name: data.name, userId });
    if (nameExists) {
      throw new Error("Já existe uma categoria com este nome");
    }
  }

  const category = await updateCategory(id, validation.data, userId);
  return category;
}
