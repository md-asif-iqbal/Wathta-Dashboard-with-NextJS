"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area, LineChart, Line } from "recharts";
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

      {/* --- Business Summary --- */}
      <Card className="shadow-sm border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Business Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingProducts || loadingOrders ? (
            <Loader label="Loading analytics" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Bars */}
              <div className="col-span-2 rounded-lg border bg-white/70 p-3 dark:bg-gray-950/40">
                <div className="text-sm text-muted-foreground mb-2">Entity overview</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Right: Mini KPIs with sparkline */}
              <div className="space-y-4 ">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">7d Orders Trend</div>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Array.from({ length: 7 }).map((_, i) => ({ d: i, v: Math.max(0, totalOrders - (6 - i)) }))}>
                        <defs>
                          <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Tooltip />
                        <Area dataKey="v" stroke="#22c55e" fill="url(#trend)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">7d Sales Sparkline</div>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={Array.from({ length: 7 }).map((_, i) => ({ d: i, v: Math.max(0, totalSales / 7 + (i - 3) * 10) }))}>
                        <Tooltip />
                        <Line type="monotone" dataKey="v" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
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
