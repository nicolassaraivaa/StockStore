import { eq, and, gte, lte, desc, asc, or, ilike, sql } from "drizzle-orm";
import { db } from "./index";
import {
  categories,
  transactions,
  products,
  productVariants,
  users,
  type Category,
  type Transaction,
  type Product,
  type ProductVariant,
  type User,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CreateTransactionInput,
  type CreateProductInput,
  type UpdateProductInput,
  type CreateProductVariantInput,
  type UpdateProductVariantInput,
  TransactionType,
} from "./schema";

// User helpers
export async function findUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function createUser(data: {
  id: string;
  email: string;
  name?: string;
}): Promise<User> {
  const result = await db
    .insert(users)
    .values({
      id: data.id,
      email: data.email,
      name: data.name || null,
    })
    .onConflictDoNothing()
    .returning();

  // Se já existe, retornar o existente
  if (result.length === 0) {
    const existing = await findUserById(data.id);
    if (!existing) {
      throw new Error("Erro ao criar usuário");
    }
    return existing;
  }

  return result[0];
}

// Category helpers
export async function findCategoryById(
  id: string,
  userId?: string
): Promise<Category | null> {
  const conditions = [eq(categories.id, id)];

  if (userId) {
    conditions.push(eq(categories.userId, userId));
  }

  const result = await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .limit(1);
  return result[0] || null;
}

export async function findCategoryBy(filters: {
  name?: string;
  id?: string;
  userId?: string;
}): Promise<Category | null> {
  const conditions = [];

  if (filters.name) {
    conditions.push(eq(categories.name, filters.name));
  }
  if (filters.id) {
    conditions.push(eq(categories.id, filters.id));
  }
  if (filters.userId) {
    conditions.push(eq(categories.userId, filters.userId));
  }

  if (conditions.length === 0) {
    return null;
  }

  const result = await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .limit(1);

  return result[0] || null;
}

export async function findManyCategories(filters?: {
  userId?: string;
  orderBy?: { name?: "asc" | "desc" };
}): Promise<Category[]> {
  const conditions = [];

  if (filters?.userId) {
    conditions.push(eq(categories.userId, filters.userId));
  }

  let query = db.select().from(categories);

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.orderBy?.name) {
    query = query.orderBy(
      filters.orderBy.name === "asc"
        ? asc(categories.name)
        : desc(categories.name)
    );
  } else {
    query = query.orderBy(asc(categories.name));
  }

  return await query;
}

export async function createCategory(
  data: CreateCategoryInput & { userId: string }
): Promise<Category> {
  const result = await db
    .insert(categories)
    .values({
      name: data.name,
      description: data.description || null,
      color: data.color,
      userId: data.userId,
    })
    .returning();

  return result[0];
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
  userId?: string
): Promise<Category> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  const conditions = [eq(categories.id, id)];
  if (userId) {
    conditions.push(eq(categories.userId, userId));
  }

  const result = await db
    .update(categories)
    .set(updateData)
    .where(and(...conditions))
    .returning();

  return result[0];
}

export async function deleteCategory(
  id: string,
  userId?: string
): Promise<void> {
  const conditions = [eq(categories.id, id)];
  if (userId) {
    conditions.push(eq(categories.userId, userId));
  }

  await db.delete(categories).where(and(...conditions));
}

// Transaction helpers
export async function findManyTransactions(filters: {
  userId: string;
  date?: { gte?: Date; lte?: Date };
  productId?: string;
  orderBy?: { date?: "asc" | "desc" };
}): Promise<Transaction[]> {
  // Garantir que sempre filtre por userId
  if (!filters.userId) {
    throw new Error("userId é obrigatório para buscar transações");
  }

  const conditions = [eq(transactions.userId, filters.userId)];

  if (filters.date) {
    if (filters.date.gte) {
      conditions.push(gte(transactions.date, filters.date.gte));
    }
    if (filters.date.lte) {
      conditions.push(lte(transactions.date, filters.date.lte));
    }
  }

  if (filters.productId) {
    conditions.push(eq(transactions.productId, filters.productId));
  }

  let query = db
    .select()
    .from(transactions)
    .where(and(...conditions));

  if (filters.orderBy?.date) {
    query = query.orderBy(
      filters.orderBy.date === "asc"
        ? asc(transactions.date)
        : desc(transactions.date)
    );
  } else {
    query = query.orderBy(desc(transactions.date));
  }

  return await query;
}

export async function findTransactionById(
  id: string,
  userId?: string
): Promise<Transaction | null> {
  const conditions = [eq(transactions.id, id)];

  if (userId) {
    conditions.push(eq(transactions.userId, userId));
  }

  const result = await db
    .select()
    .from(transactions)
    .where(and(...conditions))
    .limit(1);

  return result[0] || null;
}

export async function createTransaction(
  data: CreateTransactionInput
): Promise<Transaction> {
  const result = await db
    .insert(transactions)
    .values({
      productId: data.productId,
      variantId: data.variantId || null,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      date: data.date,
      type: data.type,
      clientName: data.clientName || null,
      observations: data.observations || null,
      userId: data.userId,
    })
    .returning();

  return result[0];
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
}

// Product helpers
export async function findProductById(
  id: string,
  userId?: string
): Promise<Product | null> {
  const conditions = [eq(products.id, id)];

  if (userId) {
    conditions.push(eq(products.userId, userId));
  }

  const result = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(1);
  return result[0] || null;
}

export async function findProductBy(filters: {
  name?: string;
  sku?: string;
  id?: string;
  userId?: string;
}): Promise<Product | null> {
  const conditions = [];

  if (filters.name) {
    conditions.push(eq(products.name, filters.name));
  }
  if (filters.sku) {
    conditions.push(eq(products.sku, filters.sku));
  }
  if (filters.id) {
    conditions.push(eq(products.id, filters.id));
  }
  if (filters.userId) {
    conditions.push(eq(products.userId, filters.userId));
  }

  if (conditions.length === 0) {
    return null;
  }

  const result = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .limit(1);

  return result[0] || null;
}

export async function findManyProducts(filters?: {
  userId?: string;
  categoryId?: string;
  search?: string;
  orderBy?: { name?: "asc" | "desc"; createdAt?: "asc" | "desc" };
}): Promise<Product[]> {
  let query = db.select().from(products);

  const conditions = [];

  if (filters?.userId) {
    conditions.push(eq(products.userId, filters.userId));
  }

  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }

  if (filters?.search) {
    // Busca por nome ou SKU
    conditions.push(
      or(
        ilike(products.name, `%${filters.search}%`),
        ilike(products.sku, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.orderBy?.name) {
    query = query.orderBy(
      filters.orderBy.name === "asc" ? asc(products.name) : desc(products.name)
    );
  } else if (filters?.orderBy?.createdAt) {
    query = query.orderBy(
      filters.orderBy.createdAt === "asc"
        ? asc(products.createdAt)
        : desc(products.createdAt)
    );
  } else {
    query = query.orderBy(desc(products.createdAt));
  }

  return await query;
}

export async function createProduct(
  data: CreateProductInput & { userId: string }
): Promise<Product> {
  const result = await db
    .insert(products)
    .values({
      name: data.name,
      categoryId: data.categoryId,
      sku: data.sku || null,
      description: data.description || null,
      color: data.color || null,
      size: data.size || null,
      costPrice: data.costPrice,
      salePrice: data.salePrice,
      stockQuantity: data.stockQuantity,
      minStock: data.minStock,
      userId: data.userId,
    })
    .returning();

  return result[0];
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput,
  userId?: string
): Promise<Product> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId;
  }
  if (data.sku !== undefined) {
    updateData.sku = data.sku || null;
  }
  if (data.description !== undefined) {
    updateData.description = data.description || null;
  }
  if (data.color !== undefined) {
    updateData.color = data.color || null;
  }
  if (data.size !== undefined) {
    updateData.size = data.size || null;
  }
  if (data.costPrice !== undefined) {
    updateData.costPrice = data.costPrice;
  }
  if (data.salePrice !== undefined) {
    updateData.salePrice = data.salePrice;
  }
  if (data.stockQuantity !== undefined) {
    updateData.stockQuantity = data.stockQuantity;
  }
  if (data.minStock !== undefined) {
    updateData.minStock = data.minStock;
  }

  const conditions = [eq(products.id, id)];
  if (userId) {
    conditions.push(eq(products.userId, userId));
  }

  const result = await db
    .update(products)
    .set(updateData)
    .where(and(...conditions))
    .returning();

  return result[0];
}

export async function deleteProduct(
  id: string,
  userId?: string
): Promise<void> {
  // Verificar se há transações associadas ao produto
  const transactionsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(eq(transactions.productId, id));

  const count = Number(transactionsResult[0]?.count || 0);

  if (count > 0) {
    throw new Error(
      `Não é possível excluir o produto pois existem ${count} transação(ões) associada(s) a ele.`
    );
  }

  const conditions = [eq(products.id, id)];
  if (userId) {
    conditions.push(eq(products.userId, userId));
  }

  await db.delete(products).where(and(...conditions));
}

// Product Variant helpers
export async function findVariantById(
  id: string
): Promise<ProductVariant | null> {
  const result = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, id))
    .limit(1);
  return result[0] || null;
}

export async function findManyVariants(filters?: {
  productId?: string;
  orderBy?: { createdAt?: "asc" | "desc" };
}): Promise<ProductVariant[]> {
  let query = db.select().from(productVariants);

  const conditions = [];

  if (filters?.productId) {
    conditions.push(eq(productVariants.productId, filters.productId));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (filters?.orderBy?.createdAt) {
    query = query.orderBy(
      filters.orderBy.createdAt === "asc"
        ? asc(productVariants.createdAt)
        : desc(productVariants.createdAt)
    );
  } else {
    query = query.orderBy(desc(productVariants.createdAt));
  }

  return await query;
}

export async function createVariant(
  data: CreateProductVariantInput
): Promise<ProductVariant> {
  const result = await db
    .insert(productVariants)
    .values({
      productId: data.productId,
      color: data.color || null,
      size: data.size || null,
      sku: data.sku || null,
      costPrice: data.costPrice || null,
      salePrice: data.salePrice || null,
      stockQuantity: data.stockQuantity,
      minStock: data.minStock || 1,
    })
    .returning();

  return result[0];
}

export async function updateVariant(
  id: string,
  data: UpdateProductVariantInput
): Promise<ProductVariant> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (data.color !== undefined) {
    updateData.color = data.color;
  }
  if (data.size !== undefined) {
    updateData.size = data.size;
  }
  if (data.sku !== undefined) {
    updateData.sku = data.sku;
  }
  if (data.costPrice !== undefined) {
    updateData.costPrice = data.costPrice;
  }
  if (data.salePrice !== undefined) {
    updateData.salePrice = data.salePrice;
  }
  if (data.stockQuantity !== undefined) {
    updateData.stockQuantity = data.stockQuantity;
  }
  if (data.minStock !== undefined) {
    updateData.minStock = data.minStock;
  }

  const result = await db
    .update(productVariants)
    .set(updateData)
    .where(eq(productVariants.id, id))
    .returning();

  return result[0];
}

export async function deleteVariant(id: string): Promise<void> {
  await db.delete(productVariants).where(eq(productVariants.id, id));
}
