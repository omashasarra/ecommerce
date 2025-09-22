// src/pages/UserAccount.jsx
import React, { useEffect, useState } from "react";
import { userAuth } from "../shared/userAuth.js";
import { useNavigate } from "react-router-dom";
import {
  EMPTY_DEFAULTS,
  loadDefaults,
  saveDefaults,
  // syncToServer,
  // hydrateFromServer,
} from "./profileDefaults";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

export default function UserAccount() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(EMPTY_DEFAULTS);
  const nav = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // auth gate
  useEffect(() => {
    if (!userAuth.user) {
      nav("/login");
      return;
    }
    // hydrate saved defaults (local)
    setProfile(loadDefaults());

    // (Optional) hydrate from server then store locally
    // (async () => { await hydrateFromServer(API_BASE); setProfile(loadDefaults()); })();

    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/services/my`, {
          headers: { Authorization: `Bearer ${userAuth.token}` },
        });
        const d = await r.json();
        setBookings(Array.isArray(d) ? d : []);
      } catch (e) {
        console.error("Failed to fetch bookings:", e);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  if (!userAuth.user) {
    return <div className="p-6">Redirecting to login...</div>;
  }

  function update(field, value) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    const merged = saveDefaults(profile);
    setProfile(merged);
    // (Optional) also sync to server
    // await syncToServer(API_BASE);
    alert("Saved ✅");
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">My Account</h1>

      {/* User info */}
      <div className="border rounded-lg p-4 mb-6 bg-gray-50">
        <p>
          <span className="font-semibold">Name:</span> {userAuth.user.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {userAuth.user.email}
        </p>
      </div>

      {/* Profile defaults (no time fields here) */}
      <form
        onSubmit={handleSave}
        className="border rounded-lg p-4 mb-8 bg-gray-50 space-y-3"
      >
        <h2 className="text-2xl font-semibold mb-2">Saved Booking Details</h2>

        <div>
          <label className="block font-medium mb-1">Phone</label>
          <PhoneInput
            placeholder="Enter phone number"
            defaultCountry="LB"
            value={profile.phone}
            onChange={(value) => update("phone", value || "")}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Address Line 1</label>
          <input
            className="border p-2 w-full rounded"
            value={profile.address1}
            onChange={(e) => update("address1", e.target.value)}
            type="text"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Address Line 2 (Optional)</label>
          <input
            className="border p-2 w-full rounded"
            value={profile.address2}
            onChange={(e) => update("address2", e.target.value)}
            type="text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium mb-1">City</label>
            <input
              className="border p-2 w-full rounded"
              value={profile.city}
              onChange={(e) => update("city", e.target.value)}
              type="text"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">State</label>
            <input
              className="border p-2 w-full rounded"
              value={profile.state}
              onChange={(e) => update("state", e.target.value)}
              type="text"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Postal Code</label>
            <input
              className="border p-2 w-full rounded"
              value={profile.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
              type="text"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Country</label>
          <input
            className="border p-2 w-full rounded"
            value={profile.country}
            onChange={(e) => update("country", e.target.value)}
            type="text"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </form>

      {/* Bookings */}
      <h2 className="text-2xl font-semibold mb-2">My Bookings</h2>
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <table className="w-full border mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Service</th>
              <th className="p-2">Dates</th>
              <th className="p-2">Times</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="p-2">{b.service?.title}</td>
                <td className="p-2">{b.startDate} → {b.endDate}</td>
                <td className="p-2">{b.startTime} - {b.endTime}</td>
                <td className="p-2">${b.totalPrice}</td>
                <td className="p-2 font-semibold">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
