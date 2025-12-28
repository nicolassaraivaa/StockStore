"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/context/AuthContext";

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório."),
    email: z.string().email("E-mail inválido. Tente novamente."),
    password: z
      .string()
      .min(6, "A senha precisa ter pelo menos 6 caracteres."),
    passwordConfirmation: z
      .string()
      .min(6, "A senha precisa ter pelo menos 6 caracteres."),
  })
  .refine(
    (data) => {
      return data.password === data.passwordConfirmation;
    },
    {
      message: "As senhas não coincidem.",
      path: ["passwordConfirmation"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const router = useRouter();
  const { signUp, authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.name);
      toast.success("Conta criada com sucesso! Seja bem-vindo(a)!");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("already registered")) {
          form.setError("email", {
            message: "Este e-mail já está cadastrado.",
          });
          toast.error("Este e-mail já está cadastrado.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Erro ao criar conta.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-white">Criar conta</CardTitle>
        <CardDescription className="text-gray-400">
          Preencha os dados abaixo para começar
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-gray-300">Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome"
                      {...field}
                      type="text"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-primary-500/20 h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-gray-300">E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      {...field}
                      type="email"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-primary-500/20 h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-gray-300">Senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-primary-500/20 h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-gray-300">Confirmar senha</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      {...field}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-primary-500/20 h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              type="submit" 
              disabled={isLoading || authState.loading} 
              className="w-full h-11 text-base font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignUpForm;

