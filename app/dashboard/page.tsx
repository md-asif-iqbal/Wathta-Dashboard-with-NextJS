"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ShoppingBag, Package, DollarSign, Truck } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Product = { _id: string };
type Order = { _id: string; clientName: string; paymentStatus: "Paid" | "Pending" | "Refunded"; deliveryStatus: "Pending" | "Shipped" | "Delivered" | "Canceled"; totalAmount?: number };

export default function DashboardHome() {
  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await fetch("/api/products")).json(),
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => (await fetch("/api/orders")).json(),
  });

  // Stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.deliveryStatus === "Delivered").length;
  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Prepare chart data
  const chartData = [
    { name: "Products", value: totalProducts },
    { name: "Orders", value: totalOrders },
    { name: "Delivered", value: deliveredOrders },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="animate-in fade-in slide-in-from-right-2">
            <Link href="/dashboard/orders/create">+ Create Order</Link>
          </Button>
          <Button asChild variant="outline" className="animate-in fade-in slide-in-from-right-4">
            <Link href="/dashboard/products/create">+ Create Product</Link>
          </Button>
          <Button asChild variant="ghost" className="animate-in fade-in slide-in-from-right-6">
            <Link href="/dashboard/orders">View Orders</Link>
          </Button>
          <Button asChild variant="ghost" className="animate-in fade-in slide-in-from-right-8">
            <Link href="/dashboard/products">View Products</Link>
          </Button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* --- Analytics Section --- */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Business Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProducts || loadingOrders ? (
            <Loader label="Loading analytics" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* --- Recent Orders --- */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <Loader label="Loading recent orders" />
          ) : orders.length === 0 ? (
            <div className="text-sm text-gray-500">No recent orders yet.</div>
          ) : (
            <table className="w-full text-sm border-t">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-2">Client</th>
                  <th className="text-left p-2">Payment</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2">{o.clientName}</td>
                    <td className="p-2">{o.paymentStatus}</td>
                    <td className="p-2">{o.deliveryStatus}</td>
                    <td className="p-2 font-medium">${o.totalAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
