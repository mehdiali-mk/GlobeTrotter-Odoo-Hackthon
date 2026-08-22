import { createContext, useCallback, useContext, useState } from "react";

// Tiny toast system built with React state only.
// Any screen can call showToast("Trip created") after a frontend action.
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, tone = "success") => {
      const id = `toast_${Date.now()}_${Math.round(Math.random() * 1000)}`;
      setToasts((current) => [...current, { id, message, tone }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastList toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  // A no-op fallback keeps components usable outside the provider (tests, SSR).
  return context || { showToast: () => {} };
}

function ToastList({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`panel pointer-events-auto flex w-full max-w-sm items-start gap-3 px-4 py-3 text-sm ${
            toast.tone === "danger" ? "border-danger/30" : "border-border"
          }`}
          style={{ boxShadow: "var(--shadow-raised)" }}
        >
          <span
            aria-hidden="true"
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              toast.tone === "danger" ? "bg-danger" : "bg-success"
            }`}
          />
          <p className="min-w-0 flex-1 text-foreground">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
