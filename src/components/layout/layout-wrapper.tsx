"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/providers/auth-provider";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { SWRegister } from "@/components/pwa/sw-register";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");

    return (
        <AuthProvider>
            <SWRegister />
            <PWAInstallPrompt />
            {isAuthPage ? (
                <main>{children}</main>
            ) : (
                <DashboardLayout>
                    {children}
                </DashboardLayout>
            )}
        </AuthProvider>
    );
}
