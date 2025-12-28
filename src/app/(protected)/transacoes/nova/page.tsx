"use client";

import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  TransactionType,
  type TransactionType as TransactionTypeType,
} from "@/types/transactions";
import Card from "@/components/Card";
import Input from "@/components/Input";
import TransactionTypeSelector from "@/components/TransactionTypeSelector";
import { AlertCircle, Calendar, DollarSign, Save, Tag } from "lucide-react";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatter";
import { useProducts } from "@/hooks/useProducts";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useVariants } from "@/hooks/useVariants";

interface formData {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  date: string;
  type: TransactionTypeType;
  clientName: string;
  observations: string;
}

const initialFormData = {
  productId: "",
  variantId: "",
  quantity: 1,
  unitPrice: 0,
  date: "",
  type: TransactionType.EXPENSE,
  clientName: "",
  observations: "",
};

export default function NewTransactionPage() {
  const [formData, setFormData] = useState<formData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const formId = useId();
  const router = useRouter();

  const { data: products = [] } = useProducts();
  const createMutation = useCreateTransaction();
  const { data: variants = [] } = useVariants(formData.productId || undefined);

  // Monitorar erros da mutation
  useEffect(() => {
    if (createMutation.isError && createMutation.error) {
      const errorMessage =
        createMutation.error instanceof Error
          ? createMutation.error.message
          : typeof createMutation.error === "string"
          ? createMutation.error
          : createMutation.error?.message || "Falha ao adicionar transação!";

      console.log("Erro detectado via useEffect:", errorMessage);
      setError(errorMessage);
    }
  }, [createMutation.isError, createMutation.error]);

  // Atualizar preço unitário quando produto ou variante for selecionado
  useEffect(() => {
    if (formData.variantId) {
      const selectedVariant = variants.find((v) => v.id === formData.variantId);
      if (selectedVariant && selectedVariant.salePrice) {
        setFormData((prev) => ({
          ...prev,
          unitPrice: selectedVariant.salePrice || 0,
        }));
      }
    } else if (formData.productId) {
      const selectedProduct = products.find((p) => p.id === formData.productId);
      if (selectedProduct && selectedProduct.salePrice && !formData.unitPrice) {
        setFormData((prev) => ({
          ...prev,
          unitPrice: selectedProduct.salePrice || 0,
        }));
      }
    }
  }, [formData.productId, formData.variantId, variants, products]);

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const selectedVariant = variants.find((v) => v.id === formData.variantId);
  const total = formData.quantity * formData.unitPrice;

  // Calcular lucro usando variante se houver, senão usar produto
  const costPrice =
    selectedVariant?.costPrice || selectedProduct?.costPrice || 0;
  const profit = formData.quantity * (formData.unitPrice - costPrice);

  const handleTransactionType = (itemType: TransactionTypeType): void => {
    setFormData((prev) => ({ ...prev, type: itemType }));
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ): void => {
    const { name, value } = event.target;

    if (name === "unitPrice") {
      const onlyNumbers = value.replace(/\D/g, "");
      const numericValue = parseFloat(onlyNumbers) / 100;
      setFormData((prev) => ({
        ...prev,
        unitPrice: isNaN(numericValue) ? 0 : numericValue,
      }));
    } else if (name === "quantity") {
      const numericValue = parseInt(value) || 1;
      setFormData((prev) => ({
        ...prev,
        quantity: numericValue,
      }));
    } else if (name === "productId") {
      // Quando produto muda, limpar variante selecionada
      setFormData((prev) => ({
        ...prev,
        productId: value,
        variantId: "",
        unitPrice: 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCancel = () => {
    router.push("/transacoes");
  };

  const validateForm = (): boolean => {
    if (
      !formData.productId ||
      !formData.quantity ||
      !formData.unitPrice ||
      !formData.date ||
      !formData.type
    ) {
      setError("Preencha todos os Campos!");
      return false;
    }

    if (formData.quantity <= 0) {
      setError("A quantidade deve ser maior que zero!");
      return false;
    }

    if (formData.unitPrice <= 0) {
      setError("O preço unitário deve ser maior que zero!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    createMutation.mutate(
      {
        productId: formData.productId,
        variantId: formData.variantId || undefined,
        quantity: formData.quantity,
        unitPrice: formData.unitPrice,
        date: `${formData.date}T12:00:00.000Z`,
        type: formData.type,
        clientName: formData.clientName || undefined,
        observations: formData.observations || undefined,
      },
      {
        onSuccess: () => {
          router.push("/transacoes");
        },
        onError: (error: any) => {
          // Exibir erro no banner vermelho igual aos outros erros de validação
          console.error("Erro capturado no onError do mutate:", error);
          console.error("Tipo do erro:", typeof error);
          console.error("Erro completo:", error);

          let errorMessage = "Falha ao adicionar transação!";

          // Tentar extrair a mensagem de erro de diferentes formas
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.toString && typeof error.toString === "function") {
            errorMessage = error.toString();
          } else if (error?.error) {
            errorMessage = error.error;
          }

          console.log("Mensagem de erro que será exibida:", errorMessage);
          setError(errorMessage);
        },
      }
    );
  };

  return (
    <div className="container-app py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nova Transação</h1>
        <Card>
          {error && (
            <div className="flex items-center bg-red-300 border border-red-700 rounded-xl p-4 mb-6 gap-2">
              <AlertCircle className="w-5 h-5 text-red-700" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor={formId}>Tipo de Transação</label>
              <TransactionTypeSelector
                id={formId}
                value={formData.type}
                onChange={handleTransactionType}
              />
            </div>

            <Select
              label="Produto"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              icon={<Tag className="w-4 h-4" />}
              className={`${
                error && !formData.productId ? "border-red-700" : ""
              }`}
              options={[
                { value: "", label: "Selecione um produto" },
                ...products.map((product) => ({
                  value: product.id,
                  label: `${product.name} - Estoque: ${
                    product.stockQuantity || 0
                  }`,
                })),
              ]}
            />

            {formData.productId && selectedProduct && (
              <Select
                label="Variante"
                name="variantId"
                value={formData.variantId || ""}
                onChange={handleChange}
                icon={<Tag className="w-4 h-4" />}
                options={[
                  // Produto base como primeira opção
                  {
                    value: "",
                    label: `${
                      [selectedProduct.color, selectedProduct.size]
                        .filter(Boolean)
                        .join(" - ") || "Produto Base"
                    } - Estoque: ${selectedProduct.stockQuantity || 0}`,
                  },
                  // Variantes
                  ...variants.map((variant) => {
                    const variantLabel = [variant.color, variant.size]
                      .filter(Boolean)
                      .join(" - ");
                    return {
                      value: variant.id,
                      label: `${variantLabel || "Variante"} - Estoque: ${
                        variant.stockQuantity
                      }`,
                    };
                  }),
                ]}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantidade"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="1"
                className={`${
                  error && formData.quantity <= 0 ? "border-red-700" : ""
                }`}
              />
              <Input
                label="Preço Unitário"
                name="unitPrice"
                type="text"
                value={
                  formData.unitPrice ? formatCurrency(formData.unitPrice) : ""
                }
                onChange={handleChange}
                placeholder="R$ 0,00"
                icon={<DollarSign className="w-4 h-4" />}
                className={`${
                  error && formData.unitPrice <= 0 ? "border-red-700" : ""
                }`}
              />
            </div>

            <Input
              label="Data"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              icon={<Calendar className="w-4 h-4 text-white" />}
              className={`${
                error && !formData.date ? "border-red-700" : ""
              } [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100`}
            />

            <Input
              label="Nome do Cliente"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Opcional"
            />

            <div className="mb-4">
              <label
                htmlFor={`${formId}-observations`}
                className="block text-sm font-medium text-gray-50 mb-2"
              >
                Observações
              </label>
              <textarea
                id={`${formId}-observations`}
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                placeholder="Observações sobre a transação..."
                className="block w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-50 transition-all focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/2 min-h-[100px] resize-y"
              />
            </div>

            {/* Resumo */}
            {formData.productId &&
              formData.quantity > 0 &&
              formData.unitPrice > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total</span>
                    <span className="text-lg font-bold text-gray-50">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  {formData.type === TransactionType.INCOME && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Lucro</span>
                      <span
                        className={`text-lg font-bold ${
                          profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(profit)}
                      </span>
                    </div>
                  )}
                </div>
              )}

            <div className="flex justify-end space-x-3 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <div className="flex items-center justify-center ">
                    <div className="w-5 h-5 border-4 border-red-950 border-t-transparent rounded-full animate-spin mr-2" />
                  </div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
