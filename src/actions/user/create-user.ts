"use server";

import { createUser } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";

export async function createUserAction(data: {
  id: string;
  email: string;
  name?: string;
}) {
  // Verificar se o usuário autenticado é o mesmo que está sendo criado
  const userId = await verifyAuth();
  
  if (userId !== data.id) {
    throw new Error("Não autorizado");
  }

  const user = await createUser(data);
  return user;
}

