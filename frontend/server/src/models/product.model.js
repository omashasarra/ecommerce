import mongoose from 'mongoose';

const simpleProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: String,
  },
  { timestamps: true }
);

export const LiteProduct =
  mongoose.models.LiteProduct ||
  mongoose.model('LiteProduct', simpleProductSchema, 'products'); 

export default LiteProduct;
