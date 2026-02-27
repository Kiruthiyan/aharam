"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: "bg-emerald-900 border-emerald-700 text-white",
    error: "bg-red-900 border-red-700 text-white",
    warning: "bg-amber-800 border-amber-600 text-white",
    info: "bg-blue-900 border-blue-700 text-white",
};

const iconStyles = {
    success: "text-emerald-300",
    error: "text-red-300",
    warning: "text-amber-300",
    info: "text-blue-300",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    let counter = 0;

    const toast = useCallback((type: ToastType, message: string) => {
        const id = Date.now() + counter++;
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map(t => {
                    const Icon = icons[t.type];
                    return (
                        <div
                            key={t.id}
                            className={clsx(
                                "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl pointer-events-auto",
                                "animate-in slide-in-from-right-full duration-300",
                                styles[t.type]
                            )}
                        >
                            <Icon className={clsx("h-5 w-5 mt-0.5 shrink-0", iconStyles[t.type])} />
                            <p className="flex-1 text-sm font-medium">{t.message}</p>
                            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity ml-1">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
