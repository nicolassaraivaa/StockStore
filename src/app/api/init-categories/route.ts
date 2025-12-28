import { NextResponse } from "next/server";
import { initializeGlobalCategories } from "@/actions/categories";

export async function POST() {
  try {
    const categories = await initializeGlobalCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Erro ao inicializar categorias:", error);
    return NextResponse.json(
      { error: "Erro ao inicializar categorias" },
      { status: 500 }
    );
  }
}
