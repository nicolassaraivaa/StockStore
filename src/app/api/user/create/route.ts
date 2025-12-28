import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth();
    const body = await request.json();
    
    // Verificar se o usuário autenticado é o mesmo que está sendo criado
    if (userId !== body.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    const user = await createUser({
      id: body.id,
      email: body.email,
      name: body.name,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}

