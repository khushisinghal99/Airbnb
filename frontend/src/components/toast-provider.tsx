"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Check, X } from "lucide-react";

type ToastItem = { id: number; message: string; kind: "success" | "error" };
const ToastContext = createContext<(message: string, kind?: ToastItem["kind"]) => void>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((message: string, kind: ToastItem["kind"] = "success") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, kind }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3400);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="fixed bottom-5 left-1/2 z-[100] flex w-[min(92vw,400px)] -translate-x-1/2 flex-col gap-2">
        {items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#222] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {item.kind === "success" ? <Check size={17} className="text-emerald-300" /> : <X size={17} className="text-rose-300" />}{item.message}
        </div>)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
