"use server";

import { verifyAuth } from "@/lib/auth";
import { findManyTransactions } from "@/lib/db/helpers";
import { db } from "@/lib/db/index";
import { products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";

dayjs.extend(utc);
dayjs.locale("pt-br");

export interface MostSoldProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export async function getMostSoldProducts(
  month?: number,
  year?: number,
  period?:
    | "current-month"
    | "last-3-months"
    | "last-6-months"
    | "last-12-months"
    | "all",
  limit: number = 5
): Promise<MostSoldProduct[]> {
  const userId = await verifyAuth();

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (period === "all") {
    startDate = undefined;
    endDate = undefined;
  } else if (period === "current-month" && month && year) {
    startDate = dayjs.utc(`${year}-${month}-01`).startOf("month").toDate();
    endDate = dayjs.utc(startDate).endOf("month").toDate();
  } else if (period && period.startsWith("last-")) {
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
    startDate = dayjs.utc(`${year}-${month}-01`).startOf("month").toDate();
    endDate = dayjs.utc(startDate).endOf("month").toDate();
  }

  const queryFilters: {
    userId: string;
    date?: { gte?: Date; lte?: Date };
  } = { userId };

  if (startDate && endDate) {
    queryFilters.date = { gte: startDate, lte: endDate };
  }

  const transactions = await findManyTransactions(queryFilters);

  // Filtrar apenas transações de receita (vendas)
  const incomeTransactions = transactions.filter(
    (t) => t.type === "INCOME" && t.productId
  );

  // Agrupar por produto e somar quantidades
  const productMap = new Map<string, { quantity: number; revenue: number }>();

  for (const transaction of incomeTransactions) {
    if (!transaction.productId) continue;

    const existing = productMap.get(transaction.productId) || {
      quantity: 0,
      revenue: 0,
    };

    existing.quantity += transaction.quantity;
    existing.revenue += transaction.quantity * transaction.unitPrice;

    productMap.set(transaction.productId, existing);
  }

  // Buscar nomes dos produtos
  const mostSoldProducts: MostSoldProduct[] = await Promise.all(
    Array.from(productMap.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, limit)
      .map(async ([productId, data]) => {
        const product = await db
          .select({ name: products.name })
          .from(products)
          .where(and(eq(products.id, productId), eq(products.userId, userId)))
          .limit(1);

        return {
          productId,
          productName: product[0]?.name || "Produto não encontrado",
          totalQuantity: data.quantity,
          totalRevenue: data.revenue,
        };
      })
  );

  return mostSoldProducts;
}
