"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authState } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authState.loading && !authState.user) {
            router.push("/login");
        }
    }, [authState, router]);

    if (authState.loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!authState.user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#101418]">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}

