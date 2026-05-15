"use client";

import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </ThemeProvider>
  );
}
