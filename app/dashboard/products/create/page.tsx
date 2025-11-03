"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import Image from "next/image";

const schema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    category: z.enum(["Electronics", "Furniture", "Clothing"]),
    price: z.coerce.number().positive("Price must be positive"),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    description: z.string().optional(),
    image: z.string().optional(),
    active: z.boolean().default(true),
  })
  .refine((val) => !!val.name && !!val.sku && !!val.category, {
    message: "Please fill required fields",
    path: ["name"],
  });

type ProductInput = z.infer<typeof schema>;

export default function CreateProduct() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { show } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { active: true },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductInput) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create product");
      return res.json();
    },
    onSuccess: () => {
      // Redirect with toast parameter to ensure user sees it after navigation
      router.push("/dashboard/products?toast=product_created");
    },
    onError: () => show({ title: "Create failed", description: "Please try again", variant: "error" }),
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setValue("image", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  const handleDrop = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIsDragging(false);
    const file = ev.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setValue("image", dataUrl);
    };
    reader.readAsDataURL(file);
  }, [setValue]);

  const handleDragOver = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Create Product</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d as ProductInput))} className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input placeholder="Product Name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Input
                placeholder="SKU"
                {...register("sku")}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase();
                  e.target.value = v;
                }}
              />
              {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <select
                className="border rounded p-2 w-full bg-transparent"
                {...register("category")}
                defaultValue=""
              >
                <option value="" disabled>
                  Select category
                </option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Clothing</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message as string}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input type="number" step="0.01" placeholder="Price" {...register("price")} />
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <Input type="number" placeholder="Stock Quantity" {...register("stock")} />
                {errors.stock && <p className="text-sm text-red-600 mt-1">{errors.stock.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Inventory & Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Description</label>
              <Textarea rows={4} placeholder="Optional description" {...register("description")} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm">Product Image (optional)</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition ${
                  isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-300 dark:border-gray-700"
                }`}
              >
                <p className="text-sm text-muted-foreground">Drag & drop an image here, or click to select</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              {preview && (
                <Image src={preview} alt="Preview" width={112} height={112} className="mt-2 h-28 w-28 rounded object-cover border" />
              )}
            </div>
            <div className="flex items-center justify-between border rounded px-3 py-2">
              <span>Active Status</span>
              <Switch defaultChecked onCheckedChange={(v) => setValue("active", v)} />
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
