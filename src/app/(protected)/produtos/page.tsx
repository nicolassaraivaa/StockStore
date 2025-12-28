"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  MoreVertical,
  Package,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/utils/formatter";
import ProductModal from "./components/product-modal";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Input from "@/components/Input";

export default function ProductsPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useProducts({
    search: searchText,
    categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
  });
  const deleteMutation = useDeleteProduct();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEdit = (productId: string) => {
    setEditingProduct(productId);
    setIsModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    setDeletingProductId(productId);
  };

  const confirmDelete = () => {
    if (deletingProductId) {
      deleteMutation.mutate(deletingProductId);
      setDeletingProductId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const productToEdit = editingProduct
    ? products.find((prod) => prod.id === editingProduct)
    : null;

  // Calcular margem
  const calculateMargin = (costPrice: number, salePrice: number): number => {
    if (costPrice === 0) return 0;
    return ((salePrice - costPrice) / costPrice) * 100;
  };

  return (
    <div className="min-h-screen bg-[#101418] px-4 sm:px-6 lg:px-8 py-8">
      <div className="container-app">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-50 mb-2">Produtos</h1>
            <p className="text-gray-400">
              {products.length}{" "}
              {products.length === 1
                ? "produto cadastrado"
                : "produtos cadastrados"}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar produto..."
              icon={<Search className="w-4 h-4" />}
              fullWidth
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-gray-50">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem
                  value="all"
                  className="text-gray-50 focus:bg-gray-700 focus:text-gray-50"
                >
                  Todas as categorias
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="text-gray-50 focus:bg-gray-700 focus:text-gray-50"
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 min-h-[400px] flex items-center justify-center">
            <div className="text-center py-12 px-6">
              <Package
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                strokeWidth={1.5}
              />
              <p className="text-gray-300 mb-6 text-base">
                Nenhum produto cadastrado
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Criar primeiro produto
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const margin = calculateMargin(
                product.costPrice,
                product.salePrice
              );

              // Verificar se o estoque está zerado ou negativo
              const stockQuantity = product.stockQuantity ?? 0;
              const isLowStock = stockQuantity <= 0;

              return (
                <div
                  key={product.id}
                  className={`rounded-lg p-6 border hover:shadow-md transition-all relative ${
                    isLowStock
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                    <div className="relative">
                      <button
                        onClick={() => {
                          setOpenMenuId(
                            openMenuId === product.id ? null : product.id
                          );
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === product.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => {
                              handleEdit(product.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(product.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nome do Produto */}
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isLowStock ? "text-red-900" : "text-gray-900"
                    }`}
                  >
                    {product.name}
                  </h3>

                  {/* Categoria */}
                  {product.category && (
                    <div className="mb-4">
                      <span
                        className="inline-block px-2 py-1 text-xs rounded-md text-gray-700 bg-gray-100"
                        style={{
                          backgroundColor: `${product.category.color}20`,
                          color: product.category.color,
                        }}
                      >
                        {product.category.name}
                      </span>
                    </div>
                  )}

                  {/* Informações Financeiras */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          isLowStock ? "text-red-700" : "text-gray-600"
                        }`}
                      >
                        Custo
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isLowStock ? "text-red-900" : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(product.costPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          isLowStock ? "text-red-700" : "text-gray-600"
                        }`}
                      >
                        Venda
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isLowStock ? "text-red-900" : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(product.salePrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          isLowStock ? "text-red-700" : "text-gray-600"
                        }`}
                      >
                        Margem
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Estoque e Variantes */}
                  <div
                    className={`mt-4 pt-4 border-t space-y-2 ${
                      isLowStock ? "border-red-200" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          isLowStock ? "text-red-700" : "text-gray-600"
                        }`}
                      >
                        Estoque
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isLowStock ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {product.stockQuantity ?? 0} un.
                      </span>
                    </div>
                    {(product as any).variantsCount > 0 && (
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm ${
                            isLowStock ? "text-red-700" : "text-gray-600"
                          }`}
                        >
                          Variantes
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isLowStock ? "text-red-900" : "text-gray-900"
                          }`}
                        >
                          {(product as any).variantsCount} variante
                          {(product as any).variantsCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ProductModal
          open={isModalOpen}
          onClose={handleCloseModal}
          product={productToEdit || undefined}
        />

        <AlertDialog
          open={!!deletingProductId}
          onOpenChange={() => setDeletingProductId(null)}
        >
          <AlertDialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-50 text-xl font-bold">
                Excluir produto
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 text-base mt-2">
                Tem certeza que deseja excluir este produto? Esta ação não pode
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
    </div>
  );
}
