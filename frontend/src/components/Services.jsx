// src/components/Services.jsx
import React, { useEffect, useMemo, useState } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { userAuth } from "../shared/userAuth.js";
import { loadDefaults, saveDefaults } from "../pages/profileDefaults.js";

/* --------- local date/time helpers --------- */
function localYYYYMMDD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function nowHHMM(d = new Date()) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function toLocalDate(dateStr, timeStr = "00:00") {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });
  const [totalPrice, setTotalPrice] = useState(0);

  // tick every minute so "now" advances without reload
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const todayLocal = useMemo(() => localYYYYMMDD(), []);
  const isStartToday = form.startDate === todayLocal;

  // recompute "current" HH:MM on each render (plus minute tick)
  const currentHHMM = nowHHMM();
  const minStartTime = isStartToday ? currentHHMM : undefined;

  // Load services
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/services");
        const d = await r.json();
        setServices(d || []);
      } catch (e) {
        console.error("Failed to load services:", e);
      }
    })();
  }, []);

  // Auto-fill contact/address from saved profile defaults when authed
  useEffect(() => {
    if (!userAuth.isAuthed()) return;
    const defaults = loadDefaults();
    setForm((f) => ({
      ...f,
      phone: defaults.phone || f.phone,
      address1: defaults.address1 || f.address1,
      address2: defaults.address2 || f.address2,
      city: defaults.city || f.city,
      state: defaults.state || f.state,
      postalCode: defaults.postalCode || f.postalCode,
      country: defaults.country || f.country,
    }));
  }, []);

  // If start date is today and selected time is in the past, bump it up to now.
  useEffect(() => {
    if (isStartToday && form.startTime && form.startTime < currentHHMM) {
      setForm((f) => ({ ...f, startTime: currentHHMM }));
    }
  }, [isStartToday, form.startTime, currentHHMM]);

  // Also recheck when just the date flips to today (no time chosen yet)
  useEffect(() => {
    if (isStartToday && form.startTime && form.startTime < nowHHMM()) {
      setForm((f) => ({ ...f, startTime: nowHHMM() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.startDate]);

  // Validation (keeps your rules)
  const validateForm = () => {
    const cityStateCountryRegex = /^[A-Za-z\s]+$/;
    const postalRegex = /^[0-9]{3,10}$/;

    if (!form.phone || !form.phone.startsWith("+"))
      return "Phone must include country code (+961, +1, etc.)";
    if (!form.address1) return "Address Line 1 is required";
    if (!cityStateCountryRegex.test(form.city))
      return "City must contain only letters";
    if (!cityStateCountryRegex.test(form.state))
      return "State must contain only letters";
    if (!cityStateCountryRegex.test(form.country))
      return "Country must contain only letters";
    if (!postalRegex.test(form.postalCode))
      return "Postal code must be numbers only";
    if (!form.startDate || !form.endDate)
      return "Start and End dates are required";
    if (!form.startTime || !form.endTime)
      return "Start and End times are required";

    // Date/time guards
    if (form.startDate < todayLocal) return "Start date cannot be before today.";
    if (form.endDate < form.startDate)
      return "End date cannot be before start date.";

    // **No booking before current time** when start is today
    if (form.startDate === todayLocal && form.startTime < nowHHMM())
      return "Start time must be later than the current time.";

    if (form.startDate === form.endDate && form.endTime <= form.startTime)
      return "End time must be later than start time when booking the same day.";

    const startDT = toLocalDate(form.startDate, form.startTime);
    const endDT = toLocalDate(form.endDate, form.endTime);
    if (endDT <= startDT) return "End datetime must be after start datetime.";
    if (startDT < new Date(new Date().setSeconds(0, 0)))
      return "Start datetime must be in the future.";

    return null;
  };

  // Booking handler
  const handleBooking = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return alert(validationError);

    if (!userAuth.isAuthed()) {
      return alert("Please log in as a user to book services.");
    }

    const normalizeTime = (t) => (t && t.length === 5 ? `${t}:00` : t);

    try {
      const res = await fetch(`${API_BASE}/api/services/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAuth.token}`,
        },
        body: JSON.stringify({
          serviceId: selected._id,
          clientName: userAuth.user?.name,
          clientEmail: userAuth.user?.email,
          ...form,
          startTime: normalizeTime(form.startTime),
          endTime: normalizeTime(form.endTime),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Booking failed");
      }

      const booking = await res.json();
      alert(`✅ Booking confirmed! Total: $${booking.totalPrice}`);

     saveDefaults({
       phone: form.phone,
       address1: form.address1,
       address2: form.address2,
       city: form.city,
       state: form.state,
       postalCode: form.postalCode,
       country: form.country,
     });

     setForm((f) => ({
       ...f,
       endDate: "",
       startTime: "",
       endTime: "",
     }));
      setSelected(null);
      setTotalPrice(0);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Our Services</h1>

      {/* Services list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s._id} className="border rounded-lg p-4 shadow">
            {s.image && (
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-40 object-cover rounded"
              />
            )}
            <h2 className="text-xl font-semibold mt-2">{s.title}</h2>
            <p className="text-gray-600">{s.description}</p>
            <p className="mt-2 font-bold">${s.pricePerHour}/hour</p>

            {userAuth.isAuthed() && userAuth.user?.role?.toLowerCase() !== "admin" ? (
              <button
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setSelected(s)}
              >
                Book Now
              </button>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                {userAuth.isAuthed()
                  ? "Admins cannot book services."
                  : "Please log in to book services."}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Booking form */}
      {selected && userAuth.isAuthed() && userAuth.user?.role?.toLowerCase() !== "admin" && (
        <div className="mt-10 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Book {selected.title}</h2>
          <form onSubmit={handleBooking} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block font-medium mb-1">Phone</label>
              <PhoneInput
                placeholder="Enter phone number"
                defaultCountry="LB"
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value || "" })}
                className="border p-2 w-full rounded"
                required
              />
            </div>

            {/* Address 1 */}
            <div>
              <label className="block font-medium mb-1">Address Line 1</label>
              <input
                type="text"
                required
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>

            {/* Address 2 */}
            <div>
              <label className="block font-medium mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>

            {/* City/State/Postal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium mb-1">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">State</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block font-medium mb-1">Country</label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="border p-2 w-full rounded"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  min={todayLocal}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">End Date</label>
                <input
                  type="date"
                  required
                  min={form.startDate || todayLocal}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  min={minStartTime}   // <— live min when start date is today
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="border p-2 w-full rounded"
                />
                {isStartToday && (
                  <p className="text-xs text-gray-500 mt-1">
                    Earliest allowed today: {currentHHMM}
                  </p>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>

            {/* Total (if computed elsewhere) */}
            {totalPrice > 0 && (
              <p className="text-lg font-bold">Total: ${totalPrice.toFixed(2)}</p>
            )}

            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
              Confirm Booking
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
