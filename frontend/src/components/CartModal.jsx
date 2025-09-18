import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useCart } from "../store/cart.jsx";

const INITIAL_BUYER = {
  fullName: "",
  email: "",
  phone: "",
  address: {
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "SA",
  },
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const phoneRe = /^\+?[0-9\s-]{8,15}$/;               // simple: 8–15 digits, allows +, space, -
const postalRe = /^[A-Za-z0-9\- ]{3,10}$/;            // 3–10 letters/digits/-

export default function CartModal({ open, onClose }) {
const { items, setQty, remove, subtotal, clear, count } = useCart();
  const [step, setStep] = React.useState("cart");
  const [placing, setPlacing] = React.useState(false);
  const [error, setError] = React.useState("");

  const API_BASE = (import.meta?.env?.VITE_API_BASE || "").replace(/\/$/, "");

  // Buyer form
  const [buyer, setBuyer] = React.useState(INITIAL_BUYER);
  const [touched, setTouched] = React.useState({});
  const [errors, setErrors] = React.useState({});

  // --- validation helpers ---
  const setField = (path, value) => {
    setBuyer((b) => {
      const next = { ...b, address: { ...b.address } };
      if (path.startsWith("address.")) {
        next.address[path.split(".")[1]] = value;
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  const touch = (path) => setTouched((t) => ({ ...t, [path]: true }));

  const validateBuyer = (b) => {
    const err = {};
    if (!b.fullName.trim() || b.fullName.trim().length < 2) err["fullName"] = "Enter your full name";
    if (!emailRe.test(b.email)) err["email"] = "Enter a valid email";
    if (!phoneRe.test(b.phone)) err["phone"] = "Enter a valid phone number";
    if (!b.address.address1.trim()) err["address.address1"] = "Address line 1 is required";
    if (!b.address.city.trim()) err["address.city"] = "City is required";
    if (!b.address.country.trim()) err["address.country"] = "Country is required";
    if (!postalRe.test(b.address.postalCode)) err["address.postalCode"] = "Enter a valid postal code";
    return err;
  };

  React.useEffect(() => {
    setErrors(validateBuyer(buyer));
  }, [buyer]);

  const hasErrors = Object.keys(errors).length > 0;
  const invalid = (path) => touched[path] && !!errors[path];
  const errText = (path) => touched[path] && errors[path] ? errors[path] : "";

  async function placeOrderCOD(e) {
    e?.preventDefault?.();
    if (items.length === 0) return;
    // final validation gate
    setTouched({
      "fullName": true,
      "email": true,
      "phone": true,
      "address.address1": true,
      "address.city": true,
      "address.postalCode": true,
      "address.country": true,
    });
    const finalErrors = validateBuyer(buyer);
    setErrors(finalErrors);
    if (Object.keys(finalErrors).length > 0) return;

    setPlacing(true);
    setError("");

    try {
      const token = localStorage.getItem("token") || "";
      const payload = {
        paymentMethod: "COD",
        buyer,
        items: items.map((it) => ({
          productId: it.id || it._id,
          qty: Number(it.qty || 1),
        })),
        shipping: 0,
        tax: 0,
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || data?.error || `Order failed (${res.status})`);

      // ✅ clear cart + form, close modal
      clear();
      setBuyer(INITIAL_BUYER);
      setTouched({});
      setStep("cart");
      alert("Order placed (Cash on delivery). Order ID: " + data.id);
      onClose?.();
    } catch (e) {
      setError(e.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  // reset step when modal closes/opens
  React.useEffect(() => {
    if (!open) {
      setStep("cart");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="w-[360px] max-h-[85vh] overflow-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            {step === "cart" ? `Your Cart (${count})` : "Your Details (COD)"}
          </h2>
          <button onClick={onClose} aria-label="Close">
            <IoCloseOutline className="text-2xl" />
          </button>
        </div>

        {/* STEP 1: CART */}
        {step === "cart" && (
          <>
            {items.length === 0 ? (
              <p className="text-sm opacity-80">Your cart is empty.</p>
            ) : (
              <>
                <ul className="divide-y">
                  {items.map((it) => (
                    <li key={it.id || it._id} className="py-3 flex gap-3">
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
                            <button className="px-2 border rounded" onClick={() => setQty(it.id || it._id, it.qty - 1)}>−</button>
                            <span>{it.qty}</span>
                            <button
                              className="px-2 border rounded"
                              onClick={() => setQty(it.id || it._id, Math.min(it.qty + 1, Number(it.stock ?? 0)))}
                              disabled={it.qty >= Number(it.stock ?? 0)}
                            >
                              +
                            </button>
                          </div>
                          <button className="text-sm underline" onClick={() => remove(it.id || it._id)}>Remove</button>
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
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}</span>
                  </div>
                  <div className="flex justify-between opacity-70"><span>Shipping & Tax</span><span>Calculated at delivery</span></div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Estimated total</span>
                    <span>{subtotal.toLocaleString(undefined, { style: "currency", currency: "USD" })}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm">Payment method: <strong>Cash on Delivery</strong></div>
                  <button
                    disabled={placing || items.length === 0 || items.some((it) => Number(it.stock ?? 0) === 0)}
                    onClick={() => setStep("form")}
                    className="w-full h-11 rounded bg-primary text-white disabled:opacity-60"
                  >
                    Continue to details
                  </button>
                  <button className="w-full h-11 rounded border" onClick={onClose}>Continue shopping</button>
                </div>
              </>
            )}
          </>
        )}

        {/* STEP 2: BUYER FORM */}
        {step === "form" && (
          <form className="space-y-3" onSubmit={placeOrderCOD} noValidate>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium">Full name</label>
                <input
                  className={`w-full h-10 px-3 rounded border ${invalid("fullName") ? "border-red-500" : ""}`}
                  value={buyer.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  onBlur={() => touch("fullName")}
                  required
                />
                {errText("fullName") && <p className="text-xs text-red-600 mt-1">{errText("fullName")}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className={`w-full h-10 px-3 rounded border ${invalid("email") ? "border-red-500" : ""}`}
                    value={buyer.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => touch("email")}
                    required
                  />
                  {errText("email") && <p className="text-xs text-red-600 mt-1">{errText("email")}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    className={`w-full h-10 px-3 rounded border ${invalid("phone") ? "border-red-500" : ""}`}
                    value={buyer.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    onBlur={() => touch("phone")}
                    placeholder="+966512345678"
                    required
                  />
                  {errText("phone") && <p className="text-xs text-red-600 mt-1">{errText("phone")}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Address line 1</label>
                <input
                  className={`w-full h-10 px-3 rounded border ${invalid("address.address1") ? "border-red-500" : ""}`}
                  value={buyer.address.address1}
                  onChange={(e) => setField("address.address1", e.target.value)}
                  onBlur={() => touch("address.address1")}
                  required
                />
                {errText("address.address1") && <p className="text-xs text-red-600 mt-1">{errText("address.address1")}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Address line 2</label>
                <input
                  className="w-full h-10 px-3 rounded border"
                  value={buyer.address.address2}
                  onChange={(e) => setField("address.address2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">City</label>
                  <input
                    className={`w-full h-10 px-3 rounded border ${invalid("address.city") ? "border-red-500" : ""}`}
                    value={buyer.address.city}
                    onChange={(e) => setField("address.city", e.target.value)}
                    onBlur={() => touch("address.city")}
                    required
                  />
                  {errText("address.city") && <p className="text-xs text-red-600 mt-1">{errText("address.city")}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">State</label>
                  <input
                    className="w-full h-10 px-3 rounded border"
                    value={buyer.address.state}
                    onChange={(e) => setField("address.state", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Postal code</label>
                  <input
                    className={`w-full h-10 px-3 rounded border ${invalid("address.postalCode") ? "border-red-500" : ""}`}
                    value={buyer.address.postalCode}
                    onChange={(e) => setField("address.postalCode", e.target.value)}
                    onBlur={() => touch("address.postalCode")}
                    required
                  />
                  {errText("address.postalCode") && <p className="text-xs text-red-600 mt-1">{errText("address.postalCode")}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Country</label>
                  <input
                    className={`w-full h-10 px-3 rounded border ${invalid("address.country") ? "border-red-500" : ""}`}
                    value={buyer.address.country}
                    onChange={(e) => setField("address.country", e.target.value)}
                    onBlur={() => touch("address.country")}
                    required
                  />
                  {errText("address.country") && <p className="text-xs text-red-600 mt-1">{errText("address.country")}</p>}
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="h-11 px-4 rounded border flex-1"
                disabled={placing}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="h-11 px-4 rounded bg-primary text-white flex-1 disabled:opacity-60"
                disabled={placing || hasErrors}
                title={hasErrors ? "Please fix the highlighted fields" : ""}
              >
                {placing ? "Placing order…" : "Submit COD order"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
