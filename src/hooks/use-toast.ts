'use client';

import { useState, useCallback } from 'react';

type ToastType = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastType;
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = `toast-${toastCount++}`;
    const newToast: Toast = { id, title, description, variant };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toast,
    toasts,
    dismiss,
  };
}
