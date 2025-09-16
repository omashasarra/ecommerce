import React from "react";

const ToastCtx = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  function notify(message, type = "success", ms = 2200) {
    const id = crypto.randomUUID?.() || String(Math.random());
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }

  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "px-3 py-2 rounded shadow text-sm " +
              (t.type === "success"
                ? "bg-emerald-600 text-white"
                : t.type === "error"
                ? "bg-rose-600 text-white"
                : "bg-gray-800 text-white")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
