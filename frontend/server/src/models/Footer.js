// src/models/footer.model.js
import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const FooterSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, default: "Eshop" }, // <-- Eshop in DB
    aboutText: {
      type: String,
      trim: true,
      default:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo voluptatibus poss",
    },
    madeBy: { type: String, trim: true, default: "Made by Sara" },

    address: { type: String, trim: true, default: "Nabatieh, Hasbaya" },
    phone: { type: String, trim: true, default: "+ 961 123 456" },

    socials: {
      instagram: { type: String, trim: true, default: "" },
      facebook: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
    },

    importantLinks: { type: [LinkSchema], default: [] },
    quickLinks: { type: [LinkSchema], default: [] },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Footer", FooterSchema);
