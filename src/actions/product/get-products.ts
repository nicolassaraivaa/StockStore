"use server";

import { findManyProducts, findProductById } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, productVariants } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

export async function getProducts(filters?: {
  categoryId?: string;
  search?: string;
}) {
  const userId = await verifyAuth();
  const products = await findManyProducts({
    userId,
    ...filters,
    orderBy: { createdAt: "desc" },
  });

  // Buscar categorias relacionadas e contagem de variantes
  const productsWithCategory = await Promise.all(
    products.map(async (product) => {
      const category = await db
        .select({
          id: categories.id,
          name: categories.name,
          color: categories.color,
        })
        .from(categories)
        .where(
          and(
            eq(categories.id, product.categoryId),
            eq(categories.userId, userId)
          )
        )
        .limit(1);

      // Contar variantes do produto
      const variantsCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(productVariants)
        .where(eq(productVariants.productId, product.id));

      return {
        ...product,
        category: category[0] || null,
        variantsCount: Number(variantsCount[0]?.count || 0),
      };
    })
  );

  return productsWithCategory;
}

export async function getProductById(id: string) {
  const userId = await verifyAuth();
  const product = await findProductById(id, userId);

  if (!product) {
    throw new Error("Produto não encontrado");
  }

  // Buscar categoria relacionada (do mesmo usuário)
  const category = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
    })
    .from(categories)
    .where(
      and(eq(categories.id, product.categoryId), eq(categories.userId, userId))
    )
    .limit(1);

  return {
    ...product,
    category: category[0] || null,
  };
}
