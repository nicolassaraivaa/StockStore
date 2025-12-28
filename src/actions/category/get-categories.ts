"use server";

import { findManyCategories, findCategoryById } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, count, and } from "drizzle-orm";

export async function getCategories() {
  const userId = await verifyAuth();
  const categories = await findManyCategories({
    userId,
    orderBy: { name: "asc" },
  });

  // Buscar contagem de produtos por categoria (apenas do usuário)
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await db
        .select({ count: count() })
        .from(products)
        .where(
          and(eq(products.categoryId, category.id), eq(products.userId, userId))
        );

      return {
        ...category,
        productCount: productCount[0]?.count || 0,
      };
    })
  );

  return categoriesWithCount;
}

export async function getCategoryById(id: string) {
  const userId = await verifyAuth();
  const category = await findCategoryById(id, userId);

  if (!category) {
    throw new Error("Categoria não encontrada");
  }

  return category;
}
