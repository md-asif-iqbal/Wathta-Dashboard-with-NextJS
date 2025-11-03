"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Truck, Clock, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";

type Order = {
  _id: string;
  orderId?: string;
  clientName: string;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  deliveryStatus: "Pending" | "Shipped" | "Delivered" | "Canceled";
  expectedDeliveryDate: string;
  totalAmount: number;
  createdAt?: string;
};

export default function OrderList() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => (await fetch("/api/orders")).json(),
  });
  const queryClient = useQueryClient();
  const { show } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const params = useSearchParams();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderId",
        header: () => "Order ID",
        cell: ({ row }) => (
          <Link href="#" className="text-blue-600 hover:underline">
            {row.original.orderId || row.original._id.slice(-6)}
          </Link>
        ),
      },
      {
        accessorKey: "clientName",
        header: () => "Client",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {row.original.clientName
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{row.original.clientName}</span>
          </div>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: () => "Payment",
        cell: ({ row }) => (
          <Badge
            className={
              row.original.paymentStatus === "Paid"
                ? "bg-green-100 text-green-700"
                : row.original.paymentStatus === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }
          >
            {row.original.paymentStatus}
          </Badge>
        ),
      },
      {
        accessorKey: "deliveryStatus",
        header: () => "Delivery",
        cell: ({ row }) => {
          const status = row.original.deliveryStatus;
          const color =
            status === "Delivered"
              ? "bg-green-100 text-green-700"
              : status === "Shipped"
              ? "bg-blue-100 text-blue-700"
              : status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700";
          return <span className={`px-2 py-1 rounded text-xs ${color}`}>{status}</span>;
        },
      },
      {
        id: "progress",
        header: () => "Progress",
        cell: ({ row }) => {
          const status = row.original.deliveryStatus;
          const value = status === "Delivered" ? 100 : status === "Shipped" ? 70 : status === "Pending" ? 30 : 0;
          const Icon = status === "Delivered" ? CheckCircle : status === "Shipped" ? Truck : status === "Pending" ? Clock : XCircle;
          const iconClass = status === "Delivered" ? "text-green-600" : status === "Shipped" ? "text-blue-600" : status === "Pending" ? "text-yellow-600" : "text-red-600";
          return (
            <div className="flex items-center gap-2 w-36">
              <Icon className={`h-4 w-4 ${iconClass}`} />
              <Progress value={value} />
            </div>
          );
        },
      },
      {
        id: "satisfaction",
        header: () => "Feedback",
        cell: ({ row }) => {
          const status = row.original.deliveryStatus;
          const raw = (row.original as { customerSatisfaction?: number | string }).customerSatisfaction;
          const val = raw != null ? (typeof raw === "string" ? Number(raw) : raw) : undefined;
          // Priority: Canceled -> 😡, Delivered/Shipped -> 😀, else use saved value or neutral
          const face = status === "Canceled"
            ? "😡"
            : status === "Delivered" || status === "Shipped"
            ? "😀"
            : val === 1
            ? "😀"
            : val === 2
            ? "😐"
            : val === 3
            ? "😡"
            : "😐";
          const title =
            status === "Canceled" ? "Canceled" : status === "Delivered" || status === "Shipped" ? "Happy" : val ? String(val) : "Neutral";
          return <span className="text-lg" title={title}>{face}</span>;
        },
      },
      {
        accessorKey: "expectedDeliveryDate",
        header: () => "Expected",
        cell: ({ row }) => new Date(row.original.expectedDeliveryDate).toLocaleDateString(),
      },
      {
        accessorKey: "totalAmount",
        header: () => "Total",
        cell: ({ row }) => <span>${row.original.totalAmount?.toFixed(2)}</span>,
      },
      {
        accessorKey: "createdAt",
        header: () => "Created",
        cell: ({ row }) => (row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "-"),
      },
      {
        id: "actions",
        header: () => "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/orders/${row.original._id}/edit`}>Edit</Link>
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setPendingDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [queryClient, show]
  );

  // show toasts on redirect (granular)
  const handledToastsRef = useRef(false);
  useEffect(() => {
    if (handledToastsRef.current) return;
    const toastsParam = params.get("toasts");
    if (!toastsParam) return;
    handledToastsRef.current = true;
    const keys = decodeURIComponent(toastsParam).split(",").filter(Boolean);
    const labels: string[] = [];
    keys.forEach((k) => {
      if (k.startsWith("status:")) {
        const status = k.split(":")[1] || "Updated";
        labels.push(`Status: ${status}`);
      } else if (k === "address_updated") labels.push("Address updated");
      else if (k === "feedback_updated") labels.push("Feedback updated");
      else if (k === "payment_updated") labels.push("Payment updated");
    });
    if (labels.length) {
      show({ title: "Order updated", description: labels.join(", "), variant: "success" });
    }
    const next = new URL(window.location.href);
    next.searchParams.delete("toasts");
    router.replace(next.pathname + next.search);
  }, [params, router, show]);

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Button asChild>
          <a href="/dashboard/orders/create">+ New Order</a>
        </Button>
      </div>
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={!!pendingDelete} onClose={() => setPendingDelete(null)}>
            <DialogHeader title="Delete order?" description={pendingDelete ? (pendingDelete.orderId || pendingDelete._id.slice(-6)) : undefined} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!pendingDelete) return;
                  const res = await fetch(`/api/orders?id=${pendingDelete._id}`, { method: "DELETE" });
                  if (res.ok) {
                    show({ title: "Order deleted", variant: "success" });
                    setPendingDelete(null);
                    queryClient.invalidateQueries({ queryKey: ["orders"] });
                  } else {
                    show({ title: "Delete failed", description: "Please try again", variant: "error" });
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </Dialog>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : (
                          <div
                            className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{ asc: " \u2191", desc: " \u2193" }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <Loader label="Loading orders" />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-sm text-gray-500">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-2 py-4">
            <div className="text-sm text-gray-500">{orders.length} orders</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
