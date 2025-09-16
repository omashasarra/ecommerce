import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    address1: { type: String, required: true },
    address2: { type: String, default: "" },
    city:     { type: String, required: true },
    state:    { type: String, default: "" },
    postalCode:{ type: String, default: "" },
    country:  { type: String, default: "" },
  },
  { _id: false }
);

const OrderItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title:    { type: String, required: true },
    price:    { type: Number, required: true },
    qty:      { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // optional if the buyer is a guest
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // buyer info (always stored for COD)
    buyer: {
      fullName: { type: String, required: true },
      email:    { type: String, required: true },
      phone:    { type: String, required: true },
      address:  { type: AddressSchema, required: true },
    },

    items:    { type: [OrderItemSchema], required: true },

    // money
    currency: { type: String, default: "USD" },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    tax:      { type: Number, default: 0 },
    total:    { type: Number, required: true },

    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    isPaid:        { type: Boolean, default: false },
    paidAt:        { type: Date },

    status: {
      type: String,
      enum: ["pending", "received", "confirmed", "shipping", "completed", "canceled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
