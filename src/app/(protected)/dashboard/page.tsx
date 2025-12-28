"use client";

import { useEffect, useState } from "react";
import MonthYearSelect from "@/components/MonthYearSelect";
import PeriodSelect, { type PeriodOption } from "@/components/PeriodSelect";
import Card from "@/components/Card";
import { ArrowUp, Calendar, TrendingUp, Wallet, Package } from "lucide-react";
import { formatCurrency } from "@/utils/formatter";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Bar,
} from "recharts";
import {
  useTransactionSummary,
  useTransactionMonthly,
  useMostSoldProducts,
} from "@/hooks/useTransactions";

const initialSummary = {
  totalIncome: 0,
  totalExpenses: 0,
  balance: 0,
  expensesByCategory: [],
};

export default function Dashboard() {
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [period, setPeriod] = useState<PeriodOption>("current-month");

  // Quando o período muda para "all", não usar filtro de mês/ano
  const shouldUseMonthYear = period === "current-month";
  const summaryMonth = shouldUseMonthYear ? month : undefined;
  const summaryYear = shouldUseMonthYear ? year : undefined;

  const { data: summary = initialSummary } = useTransactionSummary(
    summaryMonth,
    summaryYear,
    period
  );

  const { data: monthlyData } = useTransactionMonthly(month, year, 4);

  const { data: mostSoldProducts = [] } = useMostSoldProducts(
    summaryMonth,
    summaryYear,
    period,
    5
  );

  const monthlyItems = monthlyData?.history || [];

  const formatToolTipValue = (value: number | string): string => {
    return formatCurrency(typeof value === "number" ? value : 0);
  };

  const getPeriodLabel = (): string => {
    switch (period) {
      case "current-month":
        return `do mês (${month}/${year})`;
      case "last-3-months":
        return "dos últimos 3 meses";
      case "last-6-months":
        return "dos últimos 6 meses";
      case "last-12-months":
        return "dos últimos 12 meses";
      case "all":
        return "de todos os períodos";
      default:
        return "";
    }
  };

  return (
    <div className="container-app py-6 ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text 2xl font-bold mb-4 md:mb-0">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          {period === "current-month" && (
            <MonthYearSelect
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          )}
          <PeriodSelect period={period} onPeriodChange={setPeriod} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          icon={<Wallet size={20} />}
          title="Receita Total"
          subTitle={`Total disponível ${getPeriodLabel()}`}
          glowEffect={summary.balance > 0}
          hover
        >
          <p
            className={`text-2xl font-semibold mt-2
                        ${
                          summary.balance > 0
                            ? "text-primary-500"
                            : "text-red-600"
                        }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </Card>
        <Card
          icon={<ArrowUp size={20} />}
          title="Lucro Total"
          subTitle={`Total recebido ${getPeriodLabel()}`}
          hover
        >
          <p className="text-2xl font-semibold mt-2 text-primary-500 ">
            {formatCurrency(summary.totalIncome)}
          </p>
        </Card>
        <Card
          icon={<Wallet size={20} className="text-red-600" />}
          title="Gastos (Compras)"
          subTitle={`Total gasto ${getPeriodLabel()}`}
          hover
        >
          <p className="text-2xl font-semibold mt-2 text-red-600">
            {formatCurrency(summary.totalExpenses)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 mt-3">
        <Card
          icon={<Package size={20} />}
          title="Produtos Mais Vendidos"
          subTitle={`Top 5 ${getPeriodLabel()}`}
          hover
          className="min-h-80"
        >
          {mostSoldProducts.length > 0 ? (
            <div className="mt-4 space-y-3">
              {mostSoldProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-50 truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.totalQuantity}{" "}
                        {product.totalQuantity === 1 ? "unidade" : "unidades"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-500">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Nenhuma venda nesse período
            </div>
          )}
        </Card>

        <Card
          className="min-h-80 p-2.5"
          icon={<Calendar size={20} />}
          title="Histórico mensal"
          subTitle="Últimos meses"
        >
          <div className="h-72 mt-4">
            {monthlyItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyItems} margin={{ left: 40 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ style: { textTransform: "capitalize" } }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickFormatter={formatCurrency}
                    tick={{ style: { fontSize: 14 } }}
                  />
                  <Tooltip
                    formatter={formatCurrency}
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      borderColor: "2a2a2a",
                    }}
                    labelStyle={{
                      color: "#f8f8f8",
                      textTransform: "capitalize",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="expenses"
                    name={"Gastos (Compras)"}
                    fill="#ec355d"
                  />
                  <Bar dataKey="income" name={"Lucro Total"} fill="#37e359" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Nenhum gasto nesse período
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
