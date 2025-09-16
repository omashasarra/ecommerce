import mongoose from "mongoose";

const SellingSchema = new mongoose.Schema(
    {
        title:      { type: String, required: true, trim: true },
        tagline:    { type: String, default: "" },
        price:      { type: Number, required: true, min: 0 },
        unit:       { type: String, default: "one-time" },
        features:   { type: [String], default: [] },
        cta:        {type: String, default: "Get Started" },
        imageURL:   { type: String, default: "" },
        popular:    { type: Boolean, default: false },
        order:      { type: Number, default: 0 },
        active:     { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Selling = mongoose.model("Selling", SellingSchema);