// scripts/seed-footer.js
import mongoose from "mongoose";

const MONGO_URL = "mongodb://127.0.0.1:27017/services"; // force services DB

// ---------- Schemas ----------
const LinkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const SocialSchema = new mongoose.Schema(
  {
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  },
  { _id: false }
);

const FooterSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: "Eshop" },
    tagline: {
      type: String,
      default:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo voluptatibus poss",
    },
    creditLine: { type: String, default: "Made by Sara" },
    address: { type: String, default: "Nabatieh, Hasbaya" },
    phone: { type: String, default: "+961 123 456" },
    importantLinks: [LinkSchema],
    quickLinks: [LinkSchema],
    social: { type: SocialSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const Footer =
  mongoose.models.Footer || mongoose.model("Footer", FooterSchema);

// ---------- Seeder ----------
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to:", MONGO_URL);

    await Footer.deleteMany({});
    console.log("🗑️ Old footer cleared");

    await Footer.create({
      brandName: "Eshop",
      tagline:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo voluptatibus poss",
      creditLine: "Made by Sara",
      address: "Nabatieh, Hasbaya",
      phone: "+961 123 456",
      importantLinks: [
        { title: "Home", link: "/" },
        { title: "About", link: "/about" },
        { title: "Contact", link: "/contact" },
      ],
      quickLinks: [
        { title: "Shop", link: "/shop" },
        { title: "Cart", link: "/cart" },
        { title: "FAQ", link: "/faq" },
      ],
      social: {
        instagram: "https://instagram.com/example",
        facebook: "https://facebook.com/example",
        linkedin: "https://linkedin.com/company/example",
      },
    });

    console.log("🎉 ✅ Footer seeded into 'services' DB");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

main();
