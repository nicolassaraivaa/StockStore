# 💸 StockStore Interface

**StockStore Interface** é a aplicação front-end do StockStore, responsável por fornecer uma interface intuitiva e responsiva para o gerenciamento financeiro pessoal.  
Com ela, é possível visualizar categorias, transações, balanços e evolução financeira mensal de forma clara e prática.

---

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- [Next.js 15](https://nextjs.org/) - Framework React com App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query (React Query)](https://tanstack.com/query) - Gerenciamento de estado e cache de dados
- [Prisma](https://www.prisma.io/) - ORM para MongoDB
- [Firebase](https://firebase.google.com/) — Autenticação (Client + Admin)
- [React Toastify](https://fkhadra.github.io/react-toastify/introduction)
- [Recharts](https://recharts.org/)
- [Zod](https://zod.dev/) - Validação de schemas

---

## 📌 Funcionalidades

- **Categorias**

  - Listar categorias existentes.

- **Transações**

  - Listar, deletar e cadastrar transações.
  - Exibir balanço financeiro (receitas, despesas e saldo).
  - Visualizar evolução financeira mensal em gráficos (Recharts).

- **Experiência do Usuário**
  - Autenticação via **Firebase** (configure os provedores no Console do Firebase).
  - Notificações de feedback (sucesso/erro) com **React Toastify**.
  - Ícones modernos com **Lucide React**.
  - UI responsiva com **Tailwind CSS**.
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
   # Database
   DATABASE_URL=mongodb://localhost:27017/stockstore

   # Firebase Client (Frontend)
   NEXT_PUBLIC_FIREBASE_API_KEY=SUA_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=SUA_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=SUA_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=SUA_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SUA_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=SUA_FIREBASE_APP_ID

   # Firebase Admin (Backend)
   FIREBASE_PROJECT_ID=SUA_FIREBASE_PROJECT_ID
   FIREBASE_PRIVATE_KEY=SUA_FIREBASE_PRIVATE_KEY
   FIREBASE_CLIENT_EMAIL=SUA_FIREBASE_CLIENT_EMAIL

   # Environment
   NODE_ENV=development
   ```

4. Configure o banco de dados:

   ```bash
   # Gerar cliente Prisma
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

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (protected)/        # Rotas protegidas
│   │   ├── dashboard/
│   │   └── transacoes/
│   ├── login/
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Página inicial
│   └── providers.tsx      # Providers (React Query, Auth)
├── components/            # Componentes reutilizáveis
├── hooks/                 # Custom hooks (React Query)
│   ├── useTransactions.ts
│   └── useCategories.ts
├── context/              # Context API
│   └── AuthContext.tsx
├── types/                # TypeScript types
├── utils/                # Funções utilitárias
└── config/               # Configurações
    └── firebase.ts
```

---

## 🔄 Arquitetura

Este projeto foi migrado para Next.js 15 com arquitetura unificada:

- **App Router**: Uso do novo sistema de roteamento do Next.js
- **Server Actions**: Backend integrado como Server Actions (sem API externa)
- **React Query**: Gerenciamento de estado e cache de dados
- **Supabase/PostgreSQL**: Banco de dados PostgreSQL usando Drizzle ORM
- **Firebase Admin**: Autenticação server-side com Firebase Admin SDK
- **Monorepo**: Tudo em um único projeto (frontend + backend)

---

## 📁 Estrutura do Projeto

```
src/
├── actions/           # Server Actions (Backend integrado)
│   ├── transactions.ts
│   └── categories.ts
├── app/              # App Router do Next.js
│   ├── (protected)/  # Rotas protegidas
│   └── api/          # API Routes (auth, init)
├── components/        # Componentes reutilizáveis
├── hooks/            # React Query hooks
├── lib/              # Bibliotecas e utilitários
│   ├── db/           # Configuração do banco de dados (Supabase/PostgreSQL)
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── helpers.ts
│   ├── firebase-admin.ts
│   └── auth.ts
├── types/            # TypeScript types
└── utils/            # Funções utilitárias
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

Todas as variáveis de ambiente devem começar com `NEXT_PUBLIC_` para serem acessíveis no cliente.

---

Desenvolvido com ❤️ por **Nicolas Saraiva**
