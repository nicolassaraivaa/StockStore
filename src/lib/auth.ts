import { createClient } from './supabase/server';

export async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user?.id || null;
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return null;
  }
}

export async function verifyAuth(): Promise<string> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error('Usuário não autenticado!');
  }

  return userId;
}
