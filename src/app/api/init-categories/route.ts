import { NextResponse } from "next/server";
import { initializeGlobalCategories } from "@/actions/categories";
import { verifyAuth } from "@/lib/auth";

export async function POST() {
  try {
    const userId = await verifyAuth();
    const categories = await initializeGlobalCategories(userId);
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Erro ao inicializar categorias:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao inicializar categorias" },
      { status: 500 }
    );
  }
}
