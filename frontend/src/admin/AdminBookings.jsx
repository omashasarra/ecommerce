// frontend/src/pages/AdminBookings.jsx
import React, { useEffect, useState } from "react";
import { adminAuth as auth } from "../shared/adminAuth.js";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const fetchBookings = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/services/admin/bookings`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const d = await r.json();
      if (Array.isArray(d)) setBookings(d);
      else setBookings([]);
    } catch (e) {
      console.error("❌ Failed to fetch bookings", e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateBooking = async (id, changes) => {
    try {
      const r = await fetch(`${API_BASE}/api/services/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changes),
      });
      const updated = await r.json();

      if (updated && updated._id) {
        setBookings((prev) => prev.map((b) => (b._id === id ? updated : b)));
        setRescheduleId(null);
        setRescheduleForm({ startDate: "", endDate: "", startTime: "", endTime: "" });
      } else {
        console.error("❌ Update failed:", updated);
      }
    } catch (e) {
      console.error("❌ Failed to update booking", e);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const r = await fetch(`${API_BASE}/api/services/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const d = await r.json();
      if (d.success) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        console.error("❌ Delete failed:", d);
      }
    } catch (e) {
      console.error("❌ Failed to delete booking", e);
    }
  };

  if (loading) return <div className="p-6">Loading bookings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Client</th>
              <th className="p-2">Service</th>
              <th className="p-2">Dates</th>
              <th className="p-2">Times</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t align-top">
                <td className="p-2">
                  {b.clientName} <br />
                  {b.clientEmail} <br />
                  {b.phone}
                </td>
                <td className="p-2">{b.service?.title}</td>
                <td className="p-2">{b.startDate} → {b.endDate}</td>
                <td className="p-2">{b.startTime} - {b.endTime}</td>
                <td className="p-2">${b.totalPrice.toFixed(2)}</td>
                <td className="p-2 font-semibold">{b.status}</td>
                <td className="p-2 space-y-2">
                  {b.status === "pending" && (
                    <>
                      {/* Confirm */}
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded w-full"
                        onClick={() => updateBooking(b._id, { status: "confirmed" })}
                      >
                        Confirm
                      </button>

                      {/* Reschedule */}
                      {rescheduleId === b._id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateBooking(b._id, { status: "rescheduled", ...rescheduleForm });
                          }}
                          className="space-y-3 border p-3 rounded bg-gray-50"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <input type="date" required value={rescheduleForm.startDate}
                              onChange={(e) => setRescheduleForm({ ...rescheduleForm, startDate: e.target.value })}
                              className="border p-1 w-full rounded"/>
                            <input type="date" required value={rescheduleForm.endDate}
                              onChange={(e) => setRescheduleForm({ ...rescheduleForm, endDate: e.target.value })}
                              className="border p-1 w-full rounded"/>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="time" required value={rescheduleForm.startTime}
                              onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                              className="border p-1 w-full rounded"/>
                            <input type="time" required value={rescheduleForm.endTime}
                              onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                              className="border p-1 w-full rounded"/>
                          </div>
                          <div className="flex space-x-2">
                            <button type="submit" className="bg-yellow-600 text-white px-2 py-1 rounded flex-1">Save</button>
                            <button type="button" className="bg-gray-400 text-white px-2 py-1 rounded flex-1"
                              onClick={() => setRescheduleId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded w-full"
                          onClick={() => {
                            setRescheduleId(b._id);
                            setRescheduleForm({
                              startDate: b.startDate || "",
                              endDate: b.endDate || "",
                              startTime: b.startTime || "",
                              endTime: b.endTime || "",
                            });
                          }}
                        >
                          Reschedule
                        </button>
                      )}
                    </>
                  )}

                  {/* Confirmed */}
                  {b.status === "confirmed" && (
                    <span className="text-green-700 font-semibold">✔ Confirmed</span>
                  )}

                  {/* Rescheduled */}
                  {b.status === "rescheduled" && (
                    <span className="text-yellow-700 font-semibold">⏳ Rescheduled</span>
                  )}

                  {/* Delete button (always available) */}
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded w-full"
                    onClick={() => deleteBooking(b._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
