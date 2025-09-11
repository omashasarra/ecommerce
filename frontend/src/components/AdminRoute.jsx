// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../shared/auth";

export default function AdminRoute({ children }) {
  if (!auth.isAuthed()) return <Navigate to="/login" replace />;
  if (!auth.isAdmin()) return <Navigate to="/" replace />;
  return children;
}
