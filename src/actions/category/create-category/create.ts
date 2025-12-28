"use server";

import { findCategoryBy, createCategory } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";
import type { CreateCategoryInput } from "@/lib/db/schema";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
});

export async function createCategoryAction(data: CreateCategoryInput) {
  const userId = await verifyAuth();
  const validation = createCategorySchema.safeParse(data);

  if (!validation.success) {
    throw new Error("Dados inválidos");
  }

  // Verificar se já existe categoria com o mesmo nome para este usuário
  const existing = await findCategoryBy({ name: data.name, userId });
  if (existing) {
    throw new Error("Já existe uma categoria com este nome");
  }

  const category = await createCategory({ ...validation.data, userId });
  return category;
}
