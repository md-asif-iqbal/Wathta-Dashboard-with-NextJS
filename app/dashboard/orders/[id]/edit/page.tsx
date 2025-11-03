"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  orderId: z.string(),
  clientName: z.string().min(1),
  deliveryAddress: z.string().min(1),
  paymentStatus: z.enum(["Paid", "Pending", "Refunded"]),
  deliveryStatus: z.enum(["Pending", "Shipped", "Delivered", "Canceled"]),
  expectedDeliveryDate: z.string(),
  shippingCost: z.coerce.number().min(0).default(0),
  customerSatisfaction: z.coerce.number().min(1).max(3).optional(),
  products: z.array(z.object({ productId: z.string(), quantity: z.coerce.number().min(1) })),
});

type OrderInput = z.infer<typeof schema>;

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order } = useQuery({ queryKey: ["order", id], queryFn: async () => (await fetch(`/api/orders?id=${id}`)).json() });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: async () => (await fetch(`/api/products`)).json() });
  const { show } = useToast();

  const { register, handleSubmit, control, setValue, watch, formState: { isSubmitting } } = useForm<OrderInput>({ resolver: zodResolver(schema) });
  const { fields, append, remove } = useFieldArray({ control, name: "products" });
  const watchProducts = watch("products") as { productId: string; quantity: number }[];
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!order) return;
    const formattedDate = order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().slice(0, 10) : "";
    setValue("orderId", order.orderId || "");
    setValue("clientName", order.clientName || "");
    setValue("deliveryAddress", order.deliveryAddress || "");
    setValue("paymentStatus", order.paymentStatus || "Pending");
    setValue("deliveryStatus", order.deliveryStatus || "Pending");
    setValue("expectedDeliveryDate", formattedDate);
    setValue("shippingCost", order.shippingCost ?? 0);
    setValue("customerSatisfaction", order.customerSatisfaction ?? undefined);
    setValue(
      "products",
      order.products?.map((p: any) => ({ productId: p.productId?._id || p.productId, quantity: p.quantity || 1 })) || []
    );
  }, [order, setValue]);

  useEffect(() => {
    if (!products?.length) return;
    const items = watchProducts?.reduce((acc, p) => {
      const prod = products.find((x: any) => x._id === p.productId);
      return acc + (prod ? prod.price * (p.quantity || 1) : 0);
    }, 0) || 0;
    const shipping = Number(watch("shippingCost") || 0);
    setTotal(items + shipping);
  }, [watchProducts, products, watch]);

  function computeProgress(status: "Pending" | "Shipped" | "Delivered" | "Canceled") {
    return status === "Delivered" ? 100 : status === "Shipped" ? 70 : status === "Pending" ? 30 : 0;
  }

  const mutation = useMutation({
    mutationFn: async (payload: OrderInput) => {
      const cleaned: any = { ...payload };
      if (cleaned.deliveryStatus !== "Delivered") cleaned.customerSatisfaction = undefined;
      const res = await fetch(`/api/orders?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...cleaned, totalAmount: total, deliveryProgress: computeProgress(cleaned.deliveryStatus) }),
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Build granular toast messages based on changes
      const changes: string[] = [];
      if (order) {
        // intentionally skip status_updated toast per request
        if (variables.deliveryAddress !== order.deliveryAddress) changes.push("address_updated");
        const prevSat = order.customerSatisfaction ?? undefined;
        const newSat = variables.customerSatisfaction ?? undefined;
        if (newSat !== prevSat) changes.push("feedback_updated");
        if (variables.paymentStatus !== order.paymentStatus) changes.push("payment_updated");
      }
      const toasts = changes.join(",");
      const target = toasts ? `/dashboard/orders?toasts=${encodeURIComponent(toasts)}` : "/dashboard/orders?toasts=order_updated";
      router.push(target);
    },
    onError: () => show({ title: "Update failed", description: "Please try again", variant: "error" }),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="lg:col-span-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Order</h1>
        <Button variant="ghost" onClick={() => router.push("/dashboard/orders")}>Back to Orders</Button>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        
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
                <Input type="date" disabled {...register("expectedDeliveryDate")} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Client Name</label>
                <Input disabled {...register("clientName")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Payment Status</label>
                <select {...register("paymentStatus")} className="border p-2 rounded w-full bg-transparent">
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Delivery Address</label>
              <Textarea rows={3} {...register("deliveryAddress")} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Delivery Status</label>
                <select {...register("deliveryStatus")} className="border p-2 rounded w-full bg-transparent">
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Shipping Cost</label>
                <Input disabled type="number" min={0} step="0.01" {...register("shippingCost")} />
              </div>
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
                <select disabled {...register(`products.${i}.productId`)} className="border p-2 rounded w-full bg-transparent">
                  <option value="">Select product</option>
                  {products.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name} (${p.price})</option>
                  ))}
                </select>
                <Input disabled type="number" min={1} {...register(`products.${i}.quantity`)} />
                <Button disabled type="button" variant="outline" onClick={() => remove(i)} aria-label="Remove">✕</Button>
              </div>
            ))}
            <Button disabled type="button" onClick={() => append({ productId: "", quantity: 1 })}>+ Add Product</Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/orders")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
        </div>
      </form>

      <aside className="space-y-4">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Items</span><span>{watchProducts?.length || 0}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${Number(watch("shippingCost") || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Amount</span><span>${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Payment</span><span>{watch("paymentStatus")}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{watch("deliveryStatus")}</span></div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}


