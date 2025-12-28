import type { JSX } from "react";
import Button from "@/components/Button";
import {
  Package,
  TrendingUp,
  Tags,
  ShoppingCart,
  BarChart3,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: ReadonlyArray<Feature> = [
  {
    icon: <Package className="w-8 h-8 text-primary-700" />,
    title: "Controle de Estoque",
    description:
      "Gerencie seu inventário de forma eficiente. Cadastre produtos, controle quantidades e monitore níveis de estoque em tempo real.",
  },
  {
    icon: <Layers className="w-8 h-8 text-primary-700" />,
    title: "Variantes de Produtos",
    description:
      "Crie variantes com cores e tamanhos diferentes para cada produto. Controle estoque e preços individualmente por variante.",
  },
  {
    icon: <Tags className="w-8 h-8 text-primary-700" />,
    title: "Categorias Organizadas",
    description:
      "Organize seus produtos em categorias personalizadas para facilitar a busca e gestão do seu catálogo.",
  },
  {
    icon: <ShoppingCart className="w-8 h-8 text-primary-700" />,
    title: "Transações de Venda e Compra",
    description:
      "Registre todas as movimentações do seu estoque. Controle vendas, compras, clientes e tenha um histórico completo das operações.",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-primary-700" />,
    title: "Dashboard Analítico",
    description:
      "Visualize métricas importantes como receitas, lucros, produtos mais vendidos e tenha insights sobre seu negócio.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-primary-700" />,
    title: "Relatórios e Análises",
    description:
      "Acompanhe a evolução do seu negócio com relatórios detalhados. Filtre por períodos e analise o desempenho das vendas.",
  },
];

export default function Home() {
  return (
    <div className="bg-gray-950 min-h-screen">
      <div className="container-app">
        <section className="py-12 md:py-20 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Controle seu estoque com o{" "}
                <span className="text-primary-500">StockStore</span>
              </h1>
              <p className="text-lg text-white mb-8">
                Sistema completo de gestão de estoque para seu negócio. Cadastre
                produtos, controle inventário, gerencie variantes e registre
                todas as movimentações. Tudo em uma plataforma simples,
                intuitiva e poderosa.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/login">
                  <Button>Começar Agora</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-gray-900 rounded-xl">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Recursos do StockStore
              </h2>
              <p className="text-lg text-white max-w-2xl mx-auto">
                Tudo que você precisa para gerenciar seu estoque de forma
                profissional. Desde o cadastro de produtos até a análise de
                vendas e lucros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-gray-800 p-6 rounded-xl hover:shadow-lg"
                >
                  <div className="mb-4 bg-primary-500/10 p-3 rounded-full inline-block">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20 ">
          <div className=" bg-gray-900 p-8 md:p-12 rounded-xl text-center border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Pronto para organizar seu estoque?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Comece a usar o StockStore hoje mesmo e tenha o controle total
              sobre seus produtos, vendas e estoque. É gratuito e fácil de usar!
            </p>
            <Link href="/login">
              <Button className="mx-auto px-6 py-3">
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
