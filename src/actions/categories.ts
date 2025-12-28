"use server";

import { findManyCategories, findCategoryBy, createCategory } from '@/lib/db/helpers';
import { TransactionType, type Category } from '@/lib/db/schema';

export async function getCategories() {
  const categories = await findManyCategories({
    orderBy: { name: 'asc' },
  });

  return categories;
}

type GlobalCategoryInput = Pick<Category, 'name' | 'color' | 'type'>;

const globalCategories: GlobalCategoryInput[] = [
  // Despesas
  { name: 'Alimentação', color: '#FF5733', type: TransactionType.EXPENSE },
  { name: 'Transporte', color: '#33A8FF', type: TransactionType.EXPENSE },
  { name: 'Moradia', color: '#33FF57', type: TransactionType.EXPENSE },
  { name: 'Saúde', color: '#F033FF', type: TransactionType.EXPENSE },
  { name: 'Educação', color: '#FF3366', type: TransactionType.EXPENSE },
  { name: 'Lazer', color: '#FFBA33', type: TransactionType.EXPENSE },
  { name: 'Compra da Shein', color: '#33FFF6', type: TransactionType.EXPENSE },
  { name: 'Outros', color: '#B033FF', type: TransactionType.EXPENSE },

  // Receitas
  { name: 'Salário', color: '#33FF57', type: TransactionType.INCOME },
  { name: 'Venda', color: '#33A8FF', type: TransactionType.INCOME },
  { name: 'Investimentos', color: '#FFBA33', type: TransactionType.INCOME },
  { name: 'Outros', color: '#B033FF', type: TransactionType.INCOME },
];

export async function initializeGlobalCategories(): Promise<Category[]> {
  const createdCategories: Category[] = [];

  for (const category of globalCategories) {
    try {
      const existing = await findCategoryBy({
        name: category.name,
        type: category.type,
      });

      if (!existing) {
        const newCategory = await createCategory(category);
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

