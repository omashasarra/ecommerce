import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, 
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    phone: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    totalHours: Number,
    totalPrice: Number,
    status: { type: String, enum: ["pending", "confirmed", "rescheduled"], default: "pending" },
  },
  { timestamps: true }
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
