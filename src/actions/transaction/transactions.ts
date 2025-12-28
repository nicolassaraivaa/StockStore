"use server";

import { verifyAuth } from "@/lib/auth";
import {
  findManyTransactions,
  findTransactionById,
  createTransaction as createTransactionDb,
  deleteTransaction as deleteTransactionDb,
} from "@/lib/db/helpers";
import { db } from "@/lib/db/index";
import { products, productVariants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from "@/lib/schemas/transaction.schema";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";
import type { TransactionsSummary } from "@/types/transactions.type";

dayjs.extend(utc);
dayjs.locale("pt-br");

export async function getTransactions(filters?: {
  month?: number;
  year?: number;
  productId?: string;
  period?:
    | "current-month"
    | "last-3-months"
    | "last-6-months"
    | "last-12-months"
    | "all";
}) {
  const userId = await verifyAuth();

  const queryFilters: {
    userId: string;
    date?: { gte?: Date; lte?: Date };
    productId?: string;
    orderBy?: { date?: "desc" };
  } = { userId, orderBy: { date: "desc" } };

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (filters?.period === "all") {
    // Sem filtro de data - buscar todas as transações
    startDate = undefined;
    endDate = undefined;
  } else if (filters?.period === "current-month") {
    // Mês atual
    if (filters?.month && filters?.year) {
      startDate = dayjs
        .utc(`${filters.year}-${filters.month}-01`)
        .startOf("month")
        .toDate();
      endDate = dayjs.utc(startDate).endOf("month").toDate();
    } else {
      // Se não tiver mês/ano, usar mês atual
      const now = dayjs.utc();
      startDate = now.startOf("month").toDate();
      endDate = now.endOf("month").toDate();
    }
  } else if (filters?.period && filters.period.startsWith("last-")) {
    // Últimos X meses
    const months = parseInt(
      filters.period.replace("last-", "").replace("-months", "")
    );
    const currentDate =
      filters.month && filters.year
        ? dayjs.utc(`${filters.year}-${filters.month}-01`).endOf("month")
        : dayjs.utc().endOf("month");

    endDate = currentDate.toDate();
    startDate = currentDate
      .subtract(months - 1, "month")
      .startOf("month")
      .toDate();
  } else if (filters?.month && filters?.year) {
    // Fallback para mês específico (quando não há período definido)
    startDate = dayjs
      .utc(`${filters.year}-${filters.month}-01`)
      .startOf("month")
      .toDate();
    endDate = dayjs.utc(startDate).endOf("month").toDate();
  }

  if (startDate && endDate) {
    queryFilters.date = { gte: startDate, lte: endDate };
  }

  if (filters?.productId) {
    queryFilters.productId = filters.productId;
  }

  try {
    const transactions = await findManyTransactions(queryFilters);

    // Buscar produtos e variantes relacionados
    const transactionsWithRelations = await Promise.all(
      transactions.map(async (transaction) => {
        let product = null;
        let variant = null;

        // Buscar produto se houver productId (apenas do usuário atual)
        if (transaction.productId) {
          const productResult = await db
            .select()
            .from(products)
            .where(
              and(
                eq(products.id, transaction.productId),
                eq(products.userId, userId)
              )
            )
            .limit(1);
          product = productResult[0] || null;
        }

        // Buscar variante se houver variantId
        if (transaction.variantId) {
          const variantResult = await db
            .select({
              id: productVariants.id,
              color: productVariants.color,
              size: productVariants.size,
              sku: productVariants.sku,
            })
            .from(productVariants)
            .where(eq(productVariants.id, transaction.variantId))
            .limit(1);
          variant = variantResult[0] || null;
        }

        return {
          ...transaction,
          product,
          variant,
        };
      })
    );

    return transactionsWithRelations;
  } catch (error) {
    console.error("Error in getTransactions:", error);
    throw error;
  }
}

export async function getTransactionSummary(
  month?: number,
  year?: number,
  period?:
    | "current-month"
    | "last-3-months"
    | "last-6-months"
    | "last-12-months"
    | "all"
) {
  const userId = await verifyAuth();

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (period === "all") {
    // Sem filtro de data - buscar todas as transações
    startDate = undefined;
    endDate = undefined;
  } else if (period === "current-month" && month && year) {
    // Mês atual
    startDate = dayjs.utc(`${year}-${month}-01`).startOf("month").toDate();
    endDate = dayjs.utc(startDate).endOf("month").toDate();
  } else if (period && period.startsWith("last-")) {
    // Últimos X meses
    const months = parseInt(period.replace("last-", "").replace("-months", ""));
    const currentDate =
      month && year
        ? dayjs.utc(`${year}-${month}-01`).endOf("month")
        : dayjs.utc().endOf("month");

    endDate = currentDate.toDate();
    startDate = currentDate
      .subtract(months - 1, "month")
      .startOf("month")
      .toDate();
  } else if (month && year) {
    // Fallback para mês específico
    startDate = dayjs.utc(`${year}-${month}-01`).startOf("month").toDate();
    endDate = dayjs.utc(startDate).endOf("month").toDate();
  }

  const queryFilters: {
    userId: string;
    date?: { gte?: Date; lte?: Date };
    orderBy?: { date?: "desc" };
  } = { userId, orderBy: { date: "desc" } };

  if (startDate && endDate) {
    queryFilters.date = { gte: startDate, lte: endDate };
  }

  const transactions = await findManyTransactions(queryFilters);

  // Buscar produtos relacionados
  const transactionsWithProduct = await Promise.all(
    transactions.map(async (transaction) => {
      if (!transaction.productId) {
        return {
          ...transaction,
          product: null,
        };
      }

      const product = await db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, transaction.productId),
            eq(products.userId, userId)
          )
        )
        .limit(1);

      return {
        ...transaction,
        product: product[0] || null,
      };
    })
  );

  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalProfit = 0;

  for (const transaction of transactionsWithProduct) {
    const total = transaction.quantity * transaction.unitPrice;

    if (transaction.type === "INCOME") {
      // Receitas: somar em receita e calcular lucro
      totalRevenue += total;
      if (transaction.product) {
        const profit =
          transaction.quantity *
          (transaction.unitPrice - transaction.product.costPrice);
        totalProfit += profit;
      }
    } else if (transaction.type === "EXPENSE") {
      // Despesas: somar em despesas
      totalExpenses += total;
    }
  }

  const summary: TransactionsSummary = {
    totalExpenses,
    totalIncome: totalRevenue,
    balance: Number((totalRevenue - totalExpenses).toFixed(2)),
    expensesByCategory: [],
  };

  return summary;
}

export async function getTransactionMonthly(
  month: number,
  year: number,
  months: number = 6
) {
  const userId = await verifyAuth();

  const baseDate = new Date(year, month - 1, 1);

  const startDate = dayjs
    .utc(baseDate)
    .subtract(months - 1, "month")
    .startOf("month")
    .toDate();
  const endDate = dayjs.utc(baseDate).endOf("month").toDate();

  const transactions = await findManyTransactions({
    userId,
    date: { gte: startDate, lte: endDate },
  });

  const monthlyData = Array.from({ length: months }, (_, i) => {
    const data = dayjs.utc(baseDate).subtract(months - 1 - i, "month");

    return {
      name: data.format("MMM/YYYY"),
      income: 0,
      expenses: 0,
    };
  });

  transactions.forEach((transaction) => {
    const monthKey = dayjs.utc(transaction.date).format("MMM/YYYY");
    const monthData = monthlyData.find((m) => m.name === monthKey);

    if (monthData) {
      const total = transaction.quantity * transaction.unitPrice;
      if (transaction.type === "INCOME") {
        monthData.income += total;
      } else if (transaction.type === "EXPENSE") {
        monthData.expenses += total;
      }
    }
  });

  return { history: monthlyData };
}

export async function createTransaction(data: CreateTransactionInput) {
  try {
    const userId = await verifyAuth();
    const result = createTransactionSchema.safeParse(data);

    if (!result.success) {
      return { success: false, error: "Validação inválida" };
    }

    const transaction = result.data;

    // Buscar produto relacionado ANTES de criar a transação
    const productData = await db
      .select()
      .from(products)
      .where(eq(products.id, transaction.productId))
      .limit(1);

    if (!productData[0]) {
      return { success: false, error: "Produto não encontrado" };
    }

    // Validar estoque disponível para vendas (INCOME) ANTES de criar a transação
    if (transaction.type === "INCOME") {
      let availableStock = 0;

      if (transaction.variantId) {
        // Verificar estoque da variante
        const variantData = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.id, transaction.variantId))
          .limit(1);

        if (!variantData[0]) {
          return { success: false, error: "Variante não encontrada" };
        }

        availableStock = variantData[0].stockQuantity;
      } else {
        // Verificar estoque do produto base
        if (productData[0].stockQuantity === null) {
          return { success: false, error: "Produto sem estoque cadastrado" };
        }

        availableStock = productData[0].stockQuantity;
      }

      // Validar se a quantidade não excede o estoque disponível
      if (transaction.quantity > availableStock) {
        const errorMessage = `Quantidade solicitada (${transaction.quantity}) excede o estoque disponível (${availableStock})`;
        return { success: false, error: errorMessage };
      }
    }

    const parseData = new Date(transaction.date);

    // Criar transação apenas após validação
    const newTransaction = await createTransactionDb({
      ...transaction,
      userId,
      date: parseData,
      type: transaction.type,
    });

    // Atualizar estoque baseado no tipo de transação
    // INCOME (Receita/Venda): diminui estoque
    // EXPENSE (Despesa/Compra): aumenta estoque
    const quantityChange =
      transaction.type === "INCOME"
        ? -transaction.quantity
        : transaction.quantity;

    // Se houver variantId, atualizar estoque da variante
    if (newTransaction.variantId) {
      const variantData = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, newTransaction.variantId))
        .limit(1);

      if (variantData[0]) {
        const newStock = variantData[0].stockQuantity + quantityChange;
        await db
          .update(productVariants)
          .set({ stockQuantity: Math.max(0, newStock) })
          .where(eq(productVariants.id, newTransaction.variantId));
      }
    } else if (productData[0] && productData[0].stockQuantity !== null) {
      // Atualizar estoque do produto base (se não tiver variante selecionada)
      // Isso permite usar o produto base mesmo quando há variantes cadastradas
      const newStock = productData[0].stockQuantity + quantityChange;
      await db
        .update(products)
        .set({ stockQuantity: Math.max(0, newStock) })
        .where(eq(products.id, newTransaction.productId));
    }

    return {
      success: true,
      data: {
        ...newTransaction,
        product: productData[0] || null,
      },
    };
  } catch (error) {
    console.error("Erro inesperado ao criar transação:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar transação",
    };
  }
}

export async function deleteTransaction(id: string) {
  const userId = await verifyAuth();

  const transaction = await findTransactionById(id, userId);

  if (!transaction) {
    throw new Error("ID da transação inválido");
  }

  await deleteTransactionDb(id);
}
