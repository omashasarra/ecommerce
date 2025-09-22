import React, { useEffect, useState } from "react";
import { adminAuth as auth } from "../shared/adminAuth.js";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    pricePerHour: 0,
    image: null,
  });

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const loadServices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/services`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("❌ Failed to load services", err);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("pricePerHour", form.pricePerHour);
      if (form.image) fd.append("image", form.image);

      const res = await fetch(`${API_BASE}/api/services/admin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Failed to create service");
      }

      await loadServices();
      setForm({ title: "", description: "", pricePerHour: 0, image: null });
    } catch (err) {
      console.error("❌ Service creation failed:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Manage Services</h1>

      {/* Service form */}
      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 w-full"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        ></textarea>
        <input
          type="number"
          placeholder="Price per hour"
          className="border p-2 w-full"
          value={form.pricePerHour}
          onChange={(e) =>
            setForm({ ...form, pricePerHour: Number(e.target.value) })
          }
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Service
        </button>
      </form>

      {/* Service list */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s._id} className="border rounded-lg p-4">
            {s.image && (
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-32 object-cover rounded"
              />
            )}
            <h2 className="font-semibold">{s.title}</h2>
            <p>${s.pricePerHour}/hr</p>
          </div>
        ))}
      </div>
    </div>
  );
}
