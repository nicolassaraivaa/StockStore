# 💸 StockStore Interface

**StockStore Interface** é uma aplicação completa de gestão de estoque, responsável por fornecer uma interface intuitiva e responsiva para o controle de inventário, produtos, vendas e compras.  
Com ela, é possível gerenciar produtos com variantes, categorias, transações (vendas e compras), visualizar dashboard com métricas, balanços financeiros e evolução mensal de forma clara e prática.

---

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- [Next.js 15](https://nextjs.org/) - Framework React com App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query (React Query)](https://tanstack.com/query) - Gerenciamento de estado e cache de dados
- [Drizzle ORM](https://orm.drizzle.team/) - ORM para PostgreSQL
- [Supabase](https://supabase.com/) — Banco de dados PostgreSQL e Autenticação
- [Sonner](https://sonner.emilkowal.ski/) - Notificações toast elegantes
- [Recharts](https://recharts.org/) - Gráficos e visualizações
- [Zod](https://zod.dev/) - Validação de schemas
- [Radix UI](https://www.radix-ui.com/) - Componentes de UI acessíveis
- [React Hook Form](https://react-hook-form.com/) - Gerenciamento de formulários
- [Lucide React](https://lucide.dev/) - Ícones modernos
- [Day.js](https://day.js.org/) - Manipulação de datas

---

## 📌 Funcionalidades

- **Produtos**

  - Criar, editar e excluir produtos.
  - Gerenciar variantes de produtos (cores e tamanhos).
  - Controle de estoque por produto e variante.

- **Categorias**

  - Criar, editar e excluir categorias.
  - Organizar produtos por categorias.

- **Transações**

  - Registrar transações de venda e compra.
  - Listar, deletar e cadastrar transações.
  - Exibir balanço financeiro (receitas, despesas e saldo).
  - Visualizar produtos mais vendidos.
  - Visualizar evolução financeira mensal em gráficos (Recharts).

- **Dashboard**

  - Visão geral com receitas, lucros e gastos.
  - Gráficos de evolução mensal.
  - Lista de produtos mais vendidos.
  - Filtros por período (mês atual, últimos 3/6/12 meses, todos).

- **Experiência do Usuário**
  - Autenticação via **Supabase Auth** (email/senha).
  - Notificações de feedback (sucesso/erro) com **Sonner**.
  - Ícones modernos com **Lucide React**.
  - UI responsiva com **Tailwind CSS** e componentes **Radix UI**.
  - Cache inteligente com **React Query**.

---

## 🛠️ Como rodar o projeto

1. Clone o repositório:

   ```bash
   gh repo clone nicolassaraivaa/StockStore-interface
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente (.env.local):

   ```bash
   # Database (Supabase PostgreSQL)
   DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_ID.supabase.co:5432/postgres

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY

   # Environment
   NODE_ENV=development
   ```

4. Configure o banco de dados:

   ```bash
   # Gerar migrações do Drizzle
   npm run db:generate

   # Fazer push do schema para o banco
   npm run db:push
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

---

## 🔄 Arquitetura

Este projeto foi desenvolvido com Next.js 15 e arquitetura unificada:

- **App Router**: Uso do novo sistema de roteamento do Next.js
- **Server Actions**: Backend integrado como Server Actions (sem API externa)
- **React Query**: Gerenciamento de estado e cache de dados
- **Supabase/PostgreSQL**: Banco de dados PostgreSQL usando Drizzle ORM
- **Supabase Auth**: Autenticação server-side e client-side integrada
- **Arquitetura Unificada**: Tudo em um único projeto (frontend + backend)

---

## 📁 Estrutura do Projeto

```
src/
├── actions/              # Server Actions (Backend integrado)
│   ├── transaction/      # Ações relacionadas a transações
│   ├── category/         # Ações relacionadas a categorias
│   ├── product/          # Ações relacionadas a produtos
│   ├── variant/          # Ações relacionadas a variantes
│   └── user/             # Ações relacionadas a usuários
├── app/                  # App Router do Next.js
│   ├── (protected)/      # Rotas protegidas
│   │   ├── dashboard/    # Dashboard principal
│   │   ├── categorias/   # Gerenciamento de categorias
│   │   ├── produtos/     # Gerenciamento de produtos
│   │   └── transacoes/   # Gerenciamento de transações
│   ├── api/              # API Routes (auth, init, user)
│   ├── login/            # Página de login/cadastro
│   ├── layout.tsx        # Layout raiz
│   ├── page.tsx          # Página inicial
│   └── providers.tsx     # Providers (React Query, Auth)
├── components/           # Componentes reutilizáveis
│   └── ui/               # Componentes de UI (Radix UI)
├── hooks/                # Custom hooks (React Query)
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   ├── useProducts.ts
│   └── useVariants.ts
├── context/              # Context API
│   └── AuthContext.tsx   # Context de autenticação
├── lib/                  # Bibliotecas e utilitários
│   ├── db/               # Configuração do banco de dados
│   │   ├── index.ts      # Cliente Drizzle
│   │   ├── schema.ts     # Schemas do banco
│   │   └── helpers.ts    # Funções auxiliares
│   ├── supabase/         # Clientes Supabase
│   │   ├── client.ts     # Cliente browser
│   │   └── server.ts     # Cliente server
│   ├── auth.ts           # Funções de autenticação
│   └── utils.ts          # Utilitários gerais
├── types/                # TypeScript types
└── utils/                # Funções utilitárias
    └── formatter.ts      # Formatação de dados
```

---

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:generate` - Gera migrações do Drizzle
- `npm run db:migrate` - Executa migrações do banco de dados
- `npm run db:push` - Faz push do schema para o banco
- `npm run db:studio` - Abre o Drizzle Studio

---

## 🎨 Variáveis de Ambiente

- Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente (browser)
- Variáveis sem esse prefixo são apenas acessíveis no servidor
- `DATABASE_URL` deve conter a string de conexão PostgreSQL do Supabase

---

Desenvolvido com ❤️ por **Nicolas Saraiva**
