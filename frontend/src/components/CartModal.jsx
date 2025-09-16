import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useCart } from "../store/cart.jsx";

export default function CartModal({ open, onClose }) {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const [placing, setPlacing] = React.useState(false);
  const API_BASE = (import.meta?.env?.VITE_API_BASE || "").replace(/\/$/, "");

  async function checkoutCOD() {
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({
          paymentMethod: "COD",
          items: items.map(it => ({ productId: it.id, qty: it.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || data?.error || `Order failed (${res.status})`);
      clear();
      alert("Order placed (Cash on delivery). Order ID: " + data.id);
      onClose?.();
    } catch (e) {
      alert(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="w-[360px] max-h-[85vh] overflow-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                      bg-white dark:bg-gray-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} aria-label="Close">
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm opacity-80">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y">
              {items.map(it => (
                <li key={it.id} className="py-3 flex gap-3">
                  <img src={it.img} alt={it.title} className="w-16 h-16 rounded object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{it.title}</p>
                      <p className="font-medium">
                        {(Number(it.price) * Number(it.qty)).toLocaleString(undefined, { style: "currency", currency: "USD" })}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2">
                        <button className="px-2 border rounded" onClick={() => setQty(it.id, it.qty - 1)}>−</button>
                        <span>{it.qty}</span>
                        <button
                          className="px-2 border rounded"
                          onClick={() => setQty(it.id, Math.min(it.qty + 1, Number(it.stock ?? 0)))}
                          disabled={it.qty >= Number(it.stock ?? 0)}
                        >
                          +
                        </button>
                      </div>
                      <button className="text-sm underline" onClick={() => remove(it.id)}>Remove</button>
                    </div>
                    {Number(it.stock ?? 0) === 0 && <p className="text-xs mt-1 text-amber-600">Out of stock</p>}
                    {it.qty >= Number(it.stock ?? 0) && Number(it.stock ?? 0) > 0 && (
                      <p className="text-xs mt-1 text-amber-600">Only {it.stock} left</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>
                {subtotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}</span>
              </div>
              <div className="flex justify-between opacity-70">
                <span>Shipping & Tax</span><span>Calculated at delivery</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Estimated total</span>
                <span>{subtotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-sm">Payment method: <strong>Cash on Delivery</strong></div>
              <button
                disabled={placing || items.some(it => Number(it.stock ?? 0) === 0)}
                onClick={checkoutCOD}
                className="w-full h-11 rounded bg-primary text-white disabled:opacity-60"
              >
                {placing ? "Placing order…" : "Place order (COD)"}
              </button>
              <button className="w-full h-11 rounded border" onClick={onClose}>Continue shopping</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
