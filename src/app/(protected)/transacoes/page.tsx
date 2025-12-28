"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import MonthYearSelect from "@/components/MonthYearSelect";
import PeriodSelect, { type PeriodOption } from "@/components/PeriodSelect";
import { useMemo, useState, type ChangeEvent } from "react";
import Input from "@/components/Input";
import Card from "@/components/Card";
import { TransactionType, type Transactions } from "@/types/transactions";
import Button from "@/components/Button";
import { formatCurrency, formatDate } from "@/utils/formatter";
import { toast } from "sonner";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TransactionsPage() {
  const currentDate = new Date();
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [period, setPeriod] = useState<PeriodOption>("current-month");
  const [searchText, setSearchText] = useState<string>("");
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);

  // Quando o período muda para "all", não usar filtro de mês/ano
  const shouldUseMonthYear = period === "current-month";
  const transactionsMonth = shouldUseMonthYear ? month : undefined;
  const transactionsYear = shouldUseMonthYear ? year : undefined;

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useTransactions({
    month: transactionsMonth,
    year: transactionsYear,
    period,
  });

  const deleteMutation = useDeleteTransaction();

  const filteredTransactions = useMemo(() => {
    if (!searchText) {
      return transactions;
    }
    const searchUpper = searchText.toUpperCase();
    return transactions.filter((transaction) => {
      const productName = transaction.product?.name?.toUpperCase() || "";
      const clientName = transaction.clientName?.toUpperCase() || "";
      return (
        productName.includes(searchUpper) || clientName.includes(searchUpper)
      );
    });
  }, [transactions, searchText]);

  const handleDelete = (id: string): void => {
    setDeletingTransactionId(id);
  };

  const confirmDelete = (): void => {
    if (deletingTransactionId) {
      deleteMutation.mutate(deletingTransactionId, {
        onSuccess: () => {
          toast.success("Transação excluida com sucesso!");
          setDeletingTransactionId(null);
        },
        onError: () => {
          toast.error("Falha ao excluir a transação!");
          setDeletingTransactionId(null);
        },
      });
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(event.target.value);
  };

  return (
    <div className="container-app max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Transações</h1>
        <Link
          href={"/transacoes/nova"}
          className="bg-primary-500 text-[#051626] font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-all"
        >
          <Plus className="W-4 h-5 mr-1" />
          Nova Transação
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {period === "current-month" && (
          <Card>
            <MonthYearSelect
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </Card>
        )}
        <Card>
          <PeriodSelect period={period} onPeriodChange={setPeriod} />
        </Card>
      </div>

      <Card className="mb-6">
        <Input
          placeholder="Buscar transações..."
          icon={<Search className="w-4 h-4" />}
          fullWidth
          onChange={handleSearchChange}
          value={searchText}
        />
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">
              Erro ao carregar transações. Tente novamente.
            </p>
            {error instanceof Error && (
              <p className="text-sm text-gray-400">{error.message}</p>
            )}
          </div>
        ) : transactions?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma Transação encontrada.</p>

            <Link
              href={"/transacoes/nova"}
              className="w-fit mx-auto mt-6 bg-primary-500 text-[#051626] font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-all"
            >
              <Plus className="W-4 h-5 mr-1" />
              Nova Transação
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto pt-6">
            <table className="divide-y divide-gray-700 min-h-full w-full">
              <thead>
                <tr className="bg-gray-800/50">
                  <th
                    scope="col"
                    className="px-8 py-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Produto
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Quantidade
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Valor Total
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Cliente
                  </th>
                  <th
                    scope="col"
                    className="px-8 py-6 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {" "}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                {filteredTransactions.map((transaction) => {
                  const total = transaction.quantity * transaction.unitPrice;
                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-8 py-7 text-sm whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <div className="mr-2">
                            {transaction.type === TransactionType.INCOME ? (
                              <ArrowUp className="w-4 h-4 text-primary-500" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-50">
                            {transaction.product?.name ||
                              "Produto não encontrado"}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-7 text-sm text-gray-300 whitespace-nowrap text-center">
                        {transaction.quantity}x
                      </td>

                      <td className="px-8 py-7 text-sm text-gray-300 whitespace-nowrap text-center">
                        {formatDate(transaction.date)}
                      </td>

                      <td className="px-8 py-7 text-sm whitespace-nowrap text-center">
                        <span
                          className={`font-medium ${
                            transaction.type === TransactionType.INCOME
                              ? "text-primary-500"
                              : "text-red-500"
                          }`}
                        >
                          {formatCurrency(total)}
                        </span>
                      </td>

                      <td className="px-8 py-7 text-sm text-gray-300 whitespace-nowrap text-center">
                        {transaction.clientName || "-"}
                      </td>

                      <td className="px-8 py-7 whitespace-nowrap cursor-pointer text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-500 hover:text-red-400 rounded-full cursor-pointer transition-colors"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <span className="inline-block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin " />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AlertDialog
        open={!!deletingTransactionId}
        onOpenChange={() => setDeletingTransactionId(null)}
      >
        <AlertDialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-50 text-xl font-bold">
              Excluir transação
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-base mt-2">
              Tem certeza que deseja excluir esta transação? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 mt-6">
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-gray-50 border-gray-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
