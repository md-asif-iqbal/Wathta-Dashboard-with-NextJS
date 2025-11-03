"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().min(0),
  description: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean().default(true),
});

type ProductInput = z.infer<typeof schema>;

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { show } = useToast();
  const { data, isFetching } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => (await fetch(`/api/products?id=${id}`)).json(),
  });

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<ProductInput>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!data) return;
    const fields: (keyof ProductInput)[] = ["name", "sku", "category", "price", "stock", "description", "image", "active"];
    fields.forEach((f) => setValue(f, data[f] ?? (f === "active" ? true : undefined)) as any);
  }, [data, setValue]);

  const mutation = useMutation({
    mutationFn: async (payload: ProductInput) => {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      show({ title: "Product updated", description: "Changes saved", variant: "success" });
      router.push("/dashboard/products");
    },
    onError: () => show({ title: "Update failed", description: "Please try again", variant: "error" }),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Button variant="ghost" onClick={() => router.push("/dashboard/products")}>Back to Products</Button>
      </div>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Product Name" {...register("name")} />
            <Input placeholder="SKU" {...register("sku")} />
            <select className="border rounded p-2 w-full bg-transparent" {...register("category")} defaultValue="">
              <option value="" disabled>Select category</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Clothing</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" step="0.01" placeholder="Price" {...register("price")} />
              <Input type="number" placeholder="Stock" {...register("stock")} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Inventory & Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea rows={4} placeholder="Optional description" {...register("description")} />
            <div className="flex items-center justify-between border rounded px-3 py-2">
              <span>Active Status</span>
              <Switch defaultChecked onCheckedChange={(v) => setValue("active", v)} />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting || isFetching}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}


