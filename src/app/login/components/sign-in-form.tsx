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

const formSchema = z.object({
  email: z.string().email("E-mail inválido. Tente novamente."),
  password: z
    .string()
    .min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

type FormValues = z.infer<typeof formSchema>;

const SignInForm = () => {
  const router = useRouter();
  const { signIn, authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      toast.success("Seja bem-vindo(a) de volta!");
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("Email not confirmed")
        ) {
          toast.error("E-mail ou senha inválidos.");
          form.setError("email", {
            message: "E-mail ou senha inválidos.",
          });
          form.setError("password", {
            message: "E-mail ou senha inválidos.",
          });
          return;
        }
        toast.error(error.message);
      } else {
        toast.error("Erro ao fazer login.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-white">Bem-vindo de volta</CardTitle>
        <CardDescription className="text-gray-400">
          Faça login para acessar sua conta
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-5">
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
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all"
              disabled={isLoading || authState.loading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SignInForm;

