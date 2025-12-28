"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import CategoryModal from "./components/category-modal";
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

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );

  const handleEdit = (categoryId: string) => {
    setEditingCategory(categoryId);
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    setDeletingCategoryId(categoryId);
  };

  const confirmDelete = () => {
    if (deletingCategoryId) {
      deleteMutation.mutate(deletingCategoryId);
      setDeletingCategoryId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const categoryToEdit = editingCategory
    ? categories.find((cat) => cat.id === editingCategory)
    : null;

  return (
    <div className="min-h-screen bg-[#101418] px-4 sm:px-6 lg:px-8 py-8">
      <div className="container-app">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-50 mb-2">Categorias</h1>
            <p className="text-gray-400">
              {categories.length}{" "}
              {categories.length === 1
                ? "categoria cadastrada"
                : "categorias cadastradas"}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 min-h-[400px] flex items-center justify-center">
            <div className="text-center py-12 px-6">
              <Tag
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                strokeWidth={1.5}
              />
              <p className="text-gray-300 mb-6 text-base">
                Nenhuma categoria cadastrada
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Criar primeira categoria
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Tag
                      className="w-6 h-6"
                      style={{ color: category.color }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
                      aria-label="Editar categoria"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Excluir categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-50 mb-1">
                  {category.name}
                </h3>

                <p className="text-sm text-gray-400 mb-2">
                  {category.productCount || 0}{" "}
                  {category.productCount === 1 ? "produto" : "produtos"}
                </p>

                {category.description && (
                  <p className="text-sm text-gray-300">
                    {category.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <CategoryModal
          open={isModalOpen}
          onClose={handleCloseModal}
          category={categoryToEdit || undefined}
        />

        <AlertDialog
          open={!!deletingCategoryId}
          onOpenChange={() => setDeletingCategoryId(null)}
        >
          <AlertDialogContent className="bg-gray-800 border-gray-700 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-50 text-xl font-bold">
                Excluir categoria
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300 text-base mt-2">
                Tem certeza que deseja excluir esta categoria? Esta ação não
                pode ser desfeita.
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
