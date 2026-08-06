"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { motion as motionTokens } from "@/config/design-system";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/** Public marketing pages — header + footer (client-safe; no Server Component imports). */
function PublicLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="platform-surface flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <motion.div
          className={cn(className)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionTokens.page}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

/** Centered auth cards (login, register, OTP) */
function AuthLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_50%)] opacity-[0.07]" />
      <motion.div
        className={cn("relative z-10 w-full max-w-md", className)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTokens.page}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Minimal chrome — no header/footer */
function BlankLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("min-h-screen bg-background", className)}>{children}</div>;
}

/** Full-bleed system status pages */
function SystemLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative min-h-screen bg-background", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_55%)] opacity-[0.08]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export { PublicLayout, AuthLayout, BlankLayout, SystemLayout };
