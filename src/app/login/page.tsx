"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";

export default function Login() {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.user && !authState.loading) {
      router.push("/dashboard");
    }
  }, [authState.user, authState.loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
              <Wallet className="h-8 w-8 text-primary-500" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              StockStore
            </h1>
          </div>
          <p className="text-base text-gray-400 max-w-sm mx-auto">
            Gerencie suas finanças de forma simples e eficiente
          </p>
        </header>

        {/* Form Container */}
        <div className="w-full">
          <Tabs defaultValue="sign-in" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-800 p-1 rounded-lg">
              <TabsTrigger
                value="sign-in"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-md transition-all"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="sign-up"
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-md transition-all"
              >
                Criar conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in" className="mt-8">
              <SignInForm />
            </TabsContent>
            <TabsContent value="sign-up" className="mt-8">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="text-center pt-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Ao fazer login ou criar conta, você concorda com nossos{" "}
            <span className="text-primary-500 hover:text-primary-400 cursor-pointer underline">
              termos de uso
            </span>{" "}
            e{" "}
            <span className="text-primary-500 hover:text-primary-400 cursor-pointer underline">
              política de privacidade
            </span>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
