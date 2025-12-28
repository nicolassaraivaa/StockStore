"use server";

import { findManyCategories, findCategoryBy, createCategory } from '@/lib/db/helpers';
import type { Category } from '@/lib/db/schema';

export async function getCategories() {
  const categories = await findManyCategories({
    orderBy: { name: 'asc' },
  });

  return categories;
}

type GlobalCategoryInput = {
  name: string;
  color: string;
};

const globalCategories: GlobalCategoryInput[] = [
  { name: 'Alimentação', color: '#FF5733' },
  { name: 'Transporte', color: '#33A8FF' },
  { name: 'Moradia', color: '#33FF57' },
  { name: 'Saúde', color: '#F033FF' },
  { name: 'Educação', color: '#FF3366' },
  { name: 'Lazer', color: '#FFBA33' },
  { name: 'Compra da Shein', color: '#33FFF6' },
  { name: 'Outros', color: '#B033FF' },
  { name: 'Salário', color: '#33FF57' },
  { name: 'Venda', color: '#33A8FF' },
  { name: 'Investimentos', color: '#FFBA33' },
];

export async function initializeGlobalCategories(userId: string): Promise<Category[]> {
  const createdCategories: Category[] = [];

  for (const category of globalCategories) {
    try {
      const existing = await findCategoryBy({
        name: category.name,
        userId: userId,
      });

      if (!existing) {
        const newCategory = await createCategory({
          ...category,
          userId,
        });
        console.log(`✅ Criada: ${newCategory.name}`);
        createdCategories.push(newCategory);
      } else {
        createdCategories.push(existing);
      }
    } catch (error) {
      console.error(`🚨 Erro ao criar a categoria ${category.name}:`, error);
    }
  }

  console.log('☑️ Todas categorias inicializadas');

  return createdCategories;
}

