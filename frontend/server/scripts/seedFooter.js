// scripts/seedFooter.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const LinkSchema = new mongoose.Schema(
  { title: { type: String, required: true, trim: true },
    link:  { type: String, required: true, trim: true } },
  { _id: false }
);

const SocialSchema = new mongoose.Schema(
  { instagram: { type: String, default: "" },
    facebook:  { type: String, default: "" },
    linkedin:  { type: String, default: "" } },
  { _id: false }
);

const FooterSchema = new mongoose.Schema(
  {
    brandName:  { type: String, default: "Eshop" },
    tagline:    { type: String, default: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo voluptatibus poss" },
    creditLine: { type: String, default: "Made by Sara" },
    address:    { type: String, default: "Nabatieh, Hasbaya" },
    phone:      { type: String, default: "+961 123 456" },
    importantLinks: [LinkSchema],
    quickLinks:     [LinkSchema],
    social:         { type: SocialSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const Footer =
  mongoose.models.Footer || mongoose.model("Footer", FooterSchema);

async function main() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/admincms";
  const dbName = process.env.MONGO_DB || undefined;

  await mongoose.connect(uri, { dbName });
  console.log("✅ Connected");

  await Footer.deleteMany({});
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

  console.log("✅ Footer seeded");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
