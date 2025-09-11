import mongoose from 'mongoose';

const TYPES = [
  'Banner', 'Blog', 'Category', 'Footer', 'Hero', 'Navbar', 'Partners', 'Popup', 'Products', 'Services',
  'SliderComponents', 'Heading', 'Button'
];

const blockSchema = new mongoose.Schema({
  type: { type: String, enum: TYPES, required: true, index: true },
  key: { type: String, required: true, trim: true }, // unique per type
  title: { type: String, default: '' },
  image: { type: String, default: '' },
  content: { type: mongoose.Schema.Types.Mixed, default: {} }, // flexible JSON per type
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

blockSchema.index({ type: 1, key: 1 }, { unique: true });

export const VALID_TYPES = TYPES;
export default mongoose.model('Block', blockSchema);