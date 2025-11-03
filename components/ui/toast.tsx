"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "info";
  durationMs?: number;
};

type ToastContextValue = {
  show: (t: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, durationMs: 2500, variant: "default", ...t };
    setToasts((prev) => [...prev, item]);
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, item.durationMs);
    return () => clearTimeout(timeout);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 p-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md border shadow-sm backdrop-blur bg-white/90 dark:bg-gray-900/90 animate-in fade-in slide-in-from-top-4 duration-300 ${
              t.variant === "success"
                ? "border-green-200 text-green-800 dark:border-green-900/40 dark:text-green-300"
                : t.variant === "error"
                ? "border-red-200 text-red-800 dark:border-red-900/40 dark:text-red-300"
                : t.variant === "info"
                ? "border-blue-200 text-blue-800 dark:border-blue-900/40 dark:text-blue-300"
                : "border-gray-200 text-gray-900 dark:border-gray-800 dark:text-gray-200"
            }`}
          >
            <div className="px-3 py-2">
              {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
              {t.description ? <div className="text-sm opacity-90">{t.description}</div> : null}
            </div>
            <div className="h-0.5 w-full bg-transparent">
              <div className={`h-full origin-left animate-in fade-in duration-[${(t.durationMs ?? 2500) - 300}ms]`} />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


