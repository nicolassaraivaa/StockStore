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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import type { Category } from "@/lib/db/schema";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/db/schema";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const COLORS = [
  "#6B7280", // gray
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#3B82F6", // blue
  "#A855F7", // purple
  "#EC4899", // pink
];

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  category?: Category;
}

export default function CategoryModal({
  open,
  onClose,
  category,
}: CategoryModalProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: COLORS[0],
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || "",
        color: category.color,
      });
      setSelectedColor(category.color);
    } else {
      form.reset({
        name: "",
        description: "",
        color: COLORS[0],
      });
      setSelectedColor(COLORS[0]);
    }
  }, [category, form, open]);

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
      form.reset();
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 ">
                    Nome da Categoria *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Eletrônicos"
                      {...field}
                      className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da categoria..."
                      {...field}
                      className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Cor</FormLabel>
                  <FormControl>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                            field.onChange(color);
                          }}
                          className={`w-10 h-10 rounded-lg transition-all ${
                            selectedColor === color
                              ? "ring-2 ring-gray-900 ring-offset-2 ring-offset-white"
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isLoading ? "Salvando..." : category ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
