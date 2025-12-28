"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import type { CreateProductInput, UpdateProductInput } from "@/lib/db/schema";
import { formatCurrency } from "@/utils/formatter";
import VariantsSection from "./variants-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  categoryId: z.string().uuid("Categoria é obrigatória"),
  description: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  costPrice: z
    .number({
      required_error: "Preço de custo é obrigatório",
      invalid_type_error: "Preço de custo deve ser um número",
    })
    .min(0.01, "Preço de custo é obrigatório e deve ser maior que zero"),
  salePrice: z
    .number({
      required_error: "Preço de venda é obrigatório",
      invalid_type_error: "Preço de venda deve ser um número",
    })
    .min(0.01, "Preço de venda é obrigatório e deve ser maior que zero"),
  stockQuantity: z
    .number({
      required_error: "Quantidade em estoque é obrigatória",
      invalid_type_error: "Quantidade em estoque deve ser um número",
    })
    .int("Quantidade em estoque deve ser um número inteiro")
    .min(0, "Quantidade em estoque deve ser maior ou igual a zero"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    categoryId: string;
    description?: string | null;
    color?: string | null;
    size?: string | null;
    costPrice: number;
    salePrice: number;
    stockQuantity: number;
  };
}

export default function ProductModal({
  open,
  onClose,
  product,
}: ProductModalProps) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories();
  const [createdProduct, setCreatedProduct] = useState<{
    id: string;
    name: string;
    categoryId: string;
    description?: string | null;
    color?: string | null;
    size?: string | null;
    costPrice: number;
    salePrice: number;
    stockQuantity: number;
  } | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      color: "",
      size: "",
      costPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description || "",
        color: product.color || "",
        size: product.size || "",
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        stockQuantity: product.stockQuantity,
      });
      setCreatedProduct(null);
    } else if (createdProduct) {
      // Se acabou de criar, usar o produto criado
      form.reset({
        name: createdProduct.name,
        categoryId: createdProduct.categoryId,
        description: createdProduct.description || "",
        color: createdProduct.color || "",
        size: createdProduct.size || "",
        costPrice: createdProduct.costPrice,
        salePrice: createdProduct.salePrice,
        stockQuantity: createdProduct.stockQuantity,
      });
    } else {
      form.reset({
        name: "",
        categoryId: "",
        description: "",
        color: "",
        size: "",
        costPrice: 0,
        salePrice: 0,
        stockQuantity: 0,
      });
    }
  }, [product, createdProduct, form, open]);

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (product) {
        // Editando produto existente
        await updateMutation.mutateAsync({
          id: product.id,
          data: values,
        });
        onClose();
        form.reset();
      } else if (createdProduct) {
        // Atualizando produto recém-criado
        await updateMutation.mutateAsync({
          id: createdProduct.id,
          data: values,
        });
        // Atualizar o estado do produto criado
        setCreatedProduct({
          ...createdProduct,
          ...values,
        });
      } else {
        // Criar novo produto
        const newProduct = await createMutation.mutateAsync(values);
        // Após criar, manter o modal aberto e mostrar as tabs
        if (newProduct) {
          setCreatedProduct({
            id: newProduct.id,
            name: newProduct.name,
            categoryId: newProduct.categoryId,
            description: newProduct.description,
            color: newProduct.color,
            size: newProduct.size,
            costPrice: newProduct.costPrice || 0,
            salePrice: newProduct.salePrice || 0,
            stockQuantity: newProduct.stockQuantity || 0,
          });
        }
      }
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Função para formatar valor monetário (igual transações)
  const handleCurrencyChange = (
    value: string,
    onChange: (value: number) => void
  ) => {
    // Remove tudo exceto números
    const onlyNumbers = value.replace(/\D/g, "");
    // Divide por 100 para converter centavos em reais
    const numericValue = parseFloat(onlyNumbers) / 100;
    onChange(isNaN(numericValue) ? 0 : numericValue);
  };

  // Calcular lucro e margem em tempo real
  const costPrice = form.watch("costPrice") || 0;
  const salePrice = form.watch("salePrice") || 0;
  const profitPerUnit = salePrice - costPrice;
  const profitMargin =
    costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;

  // Limpar estado quando o modal fechar
  useEffect(() => {
    if (!open) {
      setCreatedProduct(null);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCreatedProduct(null);
          form.reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Header customizado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {product || createdProduct ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <button
            onClick={() => {
              setCreatedProduct(null);
              form.reset();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6">
            {product || createdProduct ? (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 mb-6">
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-md px-3 py-1.5 text-sm font-medium transition-all"
                  >
                    Detalhes
                  </TabsTrigger>
                  <TabsTrigger
                    value="variants"
                    className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-md px-3 py-1.5 text-sm font-medium transition-all"
                  >
                    Variantes
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-0">
                  {renderFormFields()}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 -mx-6 px-6 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCreatedProduct(null);
                        form.reset();
                        onClose();
                      }}
                      disabled={isLoading}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                    >
                      {createdProduct ? "Fechar" : "Cancelar"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {isLoading ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent
                  value="variants"
                  className="mt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <VariantsSection
                    productId={(product || createdProduct)!.id}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">{renderFormFields()}</div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  function renderFormFields() {
    return (
      <>
        {/* Nome do Produto */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Nome do Produto *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Camiseta Básica"
                  {...field}
                  className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria e Quantidade em Estoque lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          {/* Categoria */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Categoria *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="mt-1 bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-gray-200">
                    {isLoadingCategories ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        Carregando...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        Nenhuma categoria cadastrada
                      </div>
                    ) : (
                      categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="text-gray-900"
                        >
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantidade em Estoque */}
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Quantidade em Estoque *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      field.onChange(value);
                    }}
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700">Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do produto..."
                  {...field}
                  className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cor e Tamanho lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cor */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Cor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Azul, Vermelho..."
                    {...field}
                    value={field.value || ""}
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tamanho */}
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Tamanho</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: P, M, G, GG..."
                    {...field}
                    value={field.value || ""}
                    className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Seção de Preços */}
        <div className="bg-gray-100 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Preços</h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Preço de Custo */}
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-sm">
                    Preço de Custo *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={field.value ? formatCurrency(field.value) : ""}
                      onChange={(e) => {
                        handleCurrencyChange(e.target.value, field.onChange);
                      }}
                      className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preço de Venda */}
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-sm">
                    Preço de Venda *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={field.value ? formatCurrency(field.value) : ""}
                      onChange={(e) => {
                        handleCurrencyChange(e.target.value, field.onChange);
                      }}
                      className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Cálculo de Lucro */}
          {costPrice > 0 && salePrice > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Lucro por unidade
                </label>
                <p
                  className={`text-base font-semibold ${
                    profitPerUnit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {profitPerUnit >= 0
                    ? `R$ ${profitPerUnit.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `-R$ ${Math.abs(profitPerUnit).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  Margem de lucro
                </label>
                <p
                  className={`text-base font-semibold ${
                    profitMargin >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {!product && !createdProduct && (
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 -mx-6 px-6 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreatedProduct(null);
                form.reset();
                onClose();
              }}
              disabled={isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isLoading ? "Salvando..." : "Cadastrar"}
            </Button>
          </div>
        )}
      </>
    );
  }
}
