import mongoose, { Schema, model, models } from "mongoose";

const orderSchema = new Schema({
  clientName: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  paymentStatus: { type: String, enum: ["Paid", "Pending", "Refunded"], default: "Pending" },
  deliveryStatus: { type: String, enum: ["Pending", "Shipped", "Delivered", "Canceled"], default: "Pending" },
  expectedDeliveryDate: { type: Date, required: true },
  products: [{ productId: { type: Schema.Types.ObjectId, ref: "Product" }, quantity: Number }],
  shippingCost: { type: Number, default: 0 },
  totalAmount: Number,
  deliveryProgress: { type: Number, default: 0 }, // 0-100
  customerSatisfaction: { type: Number, min: 1, max: 3 }, // 1: 😀, 2: 😐, 3: 😡
}, { timestamps: true });

export const Order = models.Order || model("Order", orderSchema);
