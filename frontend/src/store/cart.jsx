import React from "react";

const KEY = "cart:v1";
const Ctx = React.createContext(null);

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const load = () => {
  try { const raw = localStorage.getItem(KEY); const d = raw ? JSON.parse(raw) : { items: [] }; return Array.isArray(d.items) ? d.items : []; }
  catch { return []; }
};
const save = (items) => localStorage.setItem(KEY, JSON.stringify({ items }));

export function CartProvider({ children }) {
  const [items, setItems] = React.useState(() => load());
  React.useEffect(() => { save(items); }, [items]);

  const add = React.useCallback((product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === product.id);
      const max = Number(product.stock ?? (i >= 0 ? prev[i].stock : 0) ?? 0);
      if (i < 0) {
        const addQty = Math.max(0, Math.min(qty, max));
        return addQty ? [...prev, { ...product, qty: addQty }] : prev;
      }
      const next = [...prev];
      const newQty = clamp(next[i].qty + qty, 0, max);
      next[i] = { ...next[i], stock: max, qty: newQty };
      return newQty ? next : next.filter((_, idx) => idx !== i);
    });
  }, []);

  const setQty = React.useCallback((id, qty) => {
    setItems(prev => {
      const next = prev.map(it => it.id === id ? { ...it, qty: clamp(Number(qty), 0, Number(it.stock ?? 0)) } : it);
      return next.filter(it => it.qty > 0);
    });
  }, []);

  const remove = React.useCallback((id) => setItems(prev => prev.filter(it => it.id !== id)), []);
  const clear  = React.useCallback(() => setItems([]), []);
  const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0);
  const count    = items.reduce((s, it) => s + Number(it.qty || 0), 0);

     const value = React.useMemo(
   () => ({ items, add, setQty, remove, clear, subtotal, count }),
   [items, add, setQty, remove, clear, subtotal, count]
 );

  // No JSX:
  return React.createElement(Ctx.Provider, { value }, children);
}

export function useCart() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
