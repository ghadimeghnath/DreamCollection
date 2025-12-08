"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss standard toasts
    if (type !== "loading") {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const styles = {
    success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: <CheckCircle size={20} className="text-emerald-500" /> },
    error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: <AlertCircle size={20} className="text-red-500" /> },
    warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: <AlertTriangle size={20} className="text-amber-500" /> },
    info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: <Info size={20} className="text-blue-500" /> },
    loading: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800", icon: <Loader2 size={20} className="text-indigo-600 animate-spin" /> },
  };

  const style = styles[toast.type] || styles.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg ${style.bg} ${style.border}`}
    >
      <div className="shrink-0 mt-0.5">{style.icon}</div>
      <div className={`flex-1 text-sm font-medium ${style.text}`}>{toast.message}</div>
      <button 
        onClick={() => onDismiss(toast.id)} 
        className={`shrink-0 p-1 rounded-full hover:bg-black/5 transition ${style.text}`}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};