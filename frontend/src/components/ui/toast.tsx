"use client";

import { Check } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
}
const ToastContext = createContext<{ notify: (message: string) => void } | null>(null);

/** Lightweight, polite status messages ("Gulmarg added to your journey"). Announced to screen readers. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const notify = useCallback((message: string) => {
    const id = next.current++;
    setToasts((t) => [...t.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:bottom-6 lg:left-6 lg:items-start lg:px-0">
        {toasts.map((t) => (
          <div key={t.id} className="anim-toast pointer-events-auto flex items-center gap-2.5 rounded-[3px] bg-charcoal px-4 py-3 text-[13.5px] text-ivory shadow-float">
            <Check className="h-4 w-4 text-brass-soft" aria-hidden />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  // Outside the provider (e.g. tests) fall back to a no-op so components never crash.
  return ctx ?? { notify: () => {} };
}
