import mongoose, { Schema, model, models } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true, unique: true },
  sku: { type: String, required: true, uppercase: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  description: String,
  image: String,
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const Product = models.Product || model("Product", productSchema);
