import {
  pgTable,
  text,
  timestamp,
  doublePrecision,
  pgEnum,
  index,
  unique,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "INCOME",
  "EXPENSE",
]);

// Tabela de usuários (referencia auth.users do Supabase)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // UUID do Supabase Auth
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameUserUnique: unique().on(table.name, table.userId),
    userIdIdx: index("category_user_id_idx").on(table.userId),
  })
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    sku: text("sku"),
    description: text("description"),
    color: text("color"),
    size: text("size"),
    costPrice: doublePrecision("cost_price"),
    salePrice: doublePrecision("sale_price"),
    stockQuantity: integer("stock_quantity").default(0),
    minStock: integer("min_stock").default(1),
    hasVariants: integer("has_variants").default(0).notNull(), // 0 = false, 1 = true
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    skuUserUnique: unique().on(table.sku, table.userId),
    categoryIdx: index("category_id_idx").on(table.categoryId),
    userIdIdx: index("product_user_id_idx").on(table.userId),
  })
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    color: text("color"),
    size: text("size"),
    sku: text("sku"),
    costPrice: doublePrecision("cost_price"),
    salePrice: doublePrecision("sale_price"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    minStock: integer("min_stock").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    skuUnique: unique().on(table.sku),
    productIdIdx: index("product_variant_product_id_idx").on(table.productId),
    productVariantUnique: unique().on(table.productId, table.color, table.size),
  })
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "restrict",
    }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "restrict",
    }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: doublePrecision("unit_price").notNull(),
    date: timestamp("date").notNull(),
    type: transactionTypeEnum("type").notNull(),
    clientName: text("client_name"),
    observations: text("observations"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdDateIdx: index("user_id_date_idx").on(table.userId, table.date),
    productIdIdx: index("product_id_idx").on(table.productId),
    variantIdIdx: index("variant_id_idx").on(table.variantId),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  transactions: many(transactions),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    transactions: many(transactions),
  })
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  product: one(products, {
    fields: [transactions.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [transactions.variantId],
    references: [productVariants.id],
  }),
}));

// Tipos TypeScript inferidos do schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

// Enum para uso em TypeScript
export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

// Tipos para criação
export interface CreateCategoryInput {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface CreateTransactionInput {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  date: Date;
  type: TransactionType;
  clientName?: string;
  observations?: string;
  userId: string;
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  sku?: string;
  description?: string;
  color?: string;
  size?: string;
  costPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  minStock?: number;
  hasVariants?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: string;
  sku?: string;
  description?: string;
  color?: string;
  size?: string;
  costPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  minStock?: number;
  hasVariants?: boolean;
}

export interface CreateProductVariantInput {
  productId: string;
  color?: string;
  size?: string;
  sku?: string;
  costPrice?: number;
  salePrice?: number;
  stockQuantity: number;
  minStock?: number;
}

export interface UpdateProductVariantInput {
  color?: string;
  size?: string;
  sku?: string;
  costPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  minStock?: number;
}
