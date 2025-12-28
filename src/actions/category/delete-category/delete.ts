"use server";

import { findCategoryById, deleteCategory } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";

export async function deleteCategoryAction(id: string) {
  const userId = await verifyAuth();

  // Verificar se a categoria existe e pertence ao usuário
  const existing = await findCategoryById(id, userId);
  if (!existing) {
    throw new Error("Categoria não encontrada");
  }

  await deleteCategory(id, userId);
  return { success: true };
}
