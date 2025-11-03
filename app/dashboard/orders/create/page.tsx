"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FieldError } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  orderId: z.string(),
  clientName: z.string().min(1, "Client name is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  paymentStatus: z.enum(["Paid", "Pending", "Refunded"]),
  deliveryStatus: z.enum(["Pending", "Shipped", "Delivered", "Canceled"]),
  expectedDeliveryDate: z.string().min(1, "Expected date is required"),
  products: z
    .array(
      z.object({
        productId: z.string().min(1, "Select a product"),
        quantity: z.coerce.number().min(1, "Min 1"),
      })
    )
    .min(1, "Add at least one product"),
  shippingCost: z.coerce.number().min(0).default(0),
  customerSatisfaction: z.coerce.number().min(1).max(3).optional(),
});

export default function CreateOrder() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}`;
  const { show } = useToast();

  type Product = { _id: string; name: string; price: number };
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await fetch("/api/products")).json(),
  });

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      orderId: generatedOrderId,
      products: [{ productId: "", quantity: 1 }],
      paymentStatus: "Pending",
      deliveryStatus: "Pending",
      shippingCost: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });

  // watch form values reactively for totals
  const watchProducts = useWatch({ control, name: "products" }) as { productId: string; quantity: number }[];
  const watchShipping = useWatch({ control, name: "shippingCost" }) as number | string;

  useEffect(() => {
    if (!products?.length || !watchProducts) return;
    const productsTotal = watchProducts.reduce((acc: number, p) => {
      const prod = products.find((x: Product) => x._id === p.productId);
      const qty = typeof p.quantity === "string" ? parseFloat(p.quantity as unknown as string) : (p.quantity || 1);
      return acc + (prod ? prod.price * (qty || 1) : 0);
    }, 0);
    const shipping = typeof watchShipping === "string" ? parseFloat(watchShipping) || 0 : (watchShipping || 0);
    setTotal(productsTotal + shipping);
  }, [watchProducts, watchShipping, products]);

  // derived summary values
  const itemsCount = (watchProducts || []).reduce((acc, p) => acc + (Number(p?.quantity) || 0), 0);
  const firstItem = (watchProducts || [])[0];
  const firstItemQty = Number(firstItem?.quantity || 0);
  const firstItemProduct = products.find((x: Product) => x._id === (firstItem?.productId || ""));
  const firstItemUnitPrice = firstItemProduct?.price ?? 0;
  const shippingValue = typeof watchShipping === "string" ? parseFloat(watchShipping) || 0 : (watchShipping || 0);
  const itemsSubtotal = Math.max(0, total - shippingValue);
  const lineItems = (watchProducts || []).map((p) => {
    const prod = products.find((x: Product) => x._id === p.productId);
    const qty = Number(p?.quantity || 0);
    const unit = prod?.price || 0;
    const name = prod?.name || "-";
    const lineTotal = unit * qty;
    return { name, qty, unit, lineTotal };
  });

  type OrderInput = z.infer<typeof schema>;
  // toast handled via ToastProvider

  function computeProgress(status: "Pending" | "Shipped" | "Delivered" | "Canceled") {
    return status === "Delivered" ? 100 : status === "Shipped" ? 70 : status === "Pending" ? 30 : 0;
  }

  const mutation = useMutation({
    mutationFn: async (data: OrderInput) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          totalAmount: total,
          deliveryProgress: computeProgress(data.deliveryStatus),
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      show({ title: "Order created", description: "The order was saved successfully", variant: "success" });
      router.push("/dashboard/orders");
    },
    onError: () => {
      show({ title: "Failed to create order", description: "Please try again", variant: "error" });
    },
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <h1 className="text-2xl font-semibold">Create Order</h1>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Order ID</label>
                <Input readOnly {...register("orderId")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Expected Delivery</label>
                <Input type="date" {...register("expectedDeliveryDate")} />
                {errors.expectedDeliveryDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.expectedDeliveryDate.message}</p>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Shipping Cost</label>
                <Input type="number" min={0} step="0.01" {...register("shippingCost")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Customer Satisfaction</label>
                <select {...register("customerSatisfaction")} className="border p-2 rounded w-full bg-transparent">
                  <option value="">N/A</option>
                  <option value={1}>😀 Happy</option>
                  <option value={2}>😐 Neutral</option>
                  <option value={3}>😡 Unhappy</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Client Name</label>
                <Input placeholder="Client Name" {...register("clientName")} />
                {errors.clientName && <p className="text-sm text-red-600 mt-1">{errors.clientName.message}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Payment Status</label>
                <select {...register("paymentStatus") } className="border p-2 rounded w-full bg-transparent">
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Delivery Address</label>
              <Textarea rows={3} placeholder="Delivery Address" {...register("deliveryAddress")} />
              {errors.deliveryAddress && (
                <p className="text-sm text-red-600 mt-1">{errors.deliveryAddress.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Delivery Status</label>
              <select {...register("deliveryStatus")} className="border p-2 rounded w-full bg-transparent">
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((item, i) => (
              <div key={item.id} className="grid grid-cols-[1fr_110px_40px] gap-2">
                <select {...register(`products.${i}.productId`)} className="border p-2 rounded w-full bg-transparent">
                  <option value="">Select product</option>
                  {products.map((p: Product) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (${p.price})
                    </option>
                  ))}
                </select>
                <Input type="number" min={1} {...register(`products.${i}.quantity`)} />
                <Button type="button" variant="outline" onClick={() => remove(i)} aria-label="Remove">✕</Button>
                {errors.products?.[i]?.productId && (
                  <p className="col-span-3 text-sm text-red-600">{(errors.products?.[i]?.productId as FieldError)?.message}</p>
                )}
              </div>
            ))}
            <Button type="button" onClick={() => append({ productId: "", quantity: 1 })}>
              + Add Product
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/orders")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Order"}</Button>
        </div>
      </form>

      <aside className="space-y-4">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {lineItems.length > 0 && (
              <div className="space-y-1">
                {lineItems.map((li, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate mr-2">{li.name} × {li.qty}</span>
                    <span>${li.unit.toFixed(2)} ea • ${li.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-2" />
              </div>
            )}
            <div className="flex justify-between"><span>Items</span><span>{itemsCount}</span></div>
            <div className="flex justify-between"><span>First Item Qty</span><span>{firstItemQty}</span></div>
            <div className="flex justify-between"><span>First Item Price</span><span>${firstItemUnitPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Items Subtotal</span><span>${itemsSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${shippingValue.toFixed(2)}</span></div>
            <div className="flex justify-between font-medium"><span>Total Amount</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Payment</span><span>{watch("paymentStatus")}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{watch("deliveryStatus")}</span></div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
