"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastMessage = {
  id: string;
  text: string;
  variant: "success" | "error";
};

type ToastContextValue = {
  showToast: (text: string, variant?: "success" | "error") => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, variant: "success" | "error" = "success") => {
      const id = `toast-${Date.now()}`;
      setMessages((current) => [...current, { id, text, variant }]);
      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== id));
      }, 3200);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {messages.map((message) => (
          <p
            key={message.id}
            className={`rounded-[var(--radius-xl)] px-4 py-3 text-sm font-semibold shadow-[var(--shadow-lg)] ${
              message.variant === "error"
                ? "bg-error text-white"
                : "bg-primary text-white"
            }`}
            role="status"
          >
            {message.text}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: () => undefined,
    };
  }
  return context;
}
