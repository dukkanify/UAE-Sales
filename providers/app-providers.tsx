"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

interface AppProvidersProps {
  children: React.ReactNode;
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export { AppProviders };
