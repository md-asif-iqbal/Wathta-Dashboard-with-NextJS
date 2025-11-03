"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LineChart, Line, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogFooter, DialogHeader } from "@/components/ui/dialog";

type Product = {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt?: string;
};

export default function ProductList() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => (await fetch("/api/products")).json(),
  });
  const queryClient = useQueryClient();
  const { show } = useToast();
  const params = useSearchParams();
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  // show toast on redirect
  const handledToastsRef = useRef(false);
  useEffect(() => {
    if (handledToastsRef.current) return;
    const toastParam = params.get("toast");
    const ptoasts = params.get("ptoasts");
    if (!toastParam && !ptoasts) return;
    handledToastsRef.current = true;
    if (toastParam === "product_created") {
      show({ title: "Product created", variant: "success" });
    }
    if (ptoasts) {
      const keys = decodeURIComponent(ptoasts).split(",").filter(Boolean);
      keys.forEach((k) => {
        if (k === "name") show({ title: "Name updated", variant: "success" });
        else if (k === "category") show({ title: "Category updated", variant: "success" });
        else if (k === "price") show({ title: "Price updated", variant: "success" });
        else if (k === "stock") show({ title: "Stock updated", variant: "success" });
        else if (k === "status") show({ title: "Status updated", variant: "success" });
      });
    }
    const next = new URL(window.location.href);
    next.searchParams.delete("toast");
    next.searchParams.delete("ptoasts");
    router.replace(next.pathname + next.search);
  }, [params, router, show]);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => "Name",
        cell: ({ row }) => (
          <div className="font-medium truncate max-w-[200px]" title={row.original.name}>
            {row.original.name}
          </div>
        ),
      },
      { accessorKey: "category", header: () => "Category" },
      {
        accessorKey: "price",
        header: () => "Price",
        cell: ({ row }) => <span>${row.original.price.toFixed(2)}</span>,
      },
      {
        accessorKey: "stock",
        header: () => "Stock",
        cell: ({ row }) => {
          const s = row.original.stock;
          const color = s > 50 ? "bg-green-100 text-green-700" : s < 10 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
          return <span className={`px-2 py-1 rounded text-xs ${color}`}>{s}</span>;
        },
      },
      {
        id: "satisfaction",
        header: () => "Satisfaction",
        cell: () => {
          const faces = ["😀", "😐", "😡"];
          const pick = faces[Math.floor(Math.random() * faces.length)];
          return <span className="text-lg" aria-label="satisfaction">{pick}</span>;
        },
      },
      {
        id: "sales",
        header: () => "7d Sales",
        cell: () => {
          const data = Array.from({ length: 7 }).map((_, i) => ({ d: i, v: Math.random() * 100 }));
          return (
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <ReTooltip />
                  <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        },
      },
      {
        accessorKey: "active",
        header: () => "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "default" : "secondary"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/dashboard/products/${row.original._id}/edit`}>Edit</Link>
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setPendingDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // removed unused table without filters

  // Apply external filters
  const filteredData = useMemo(() => {
    return products.filter((p) => {
      const byCategory = categoryFilter ? p.category === categoryFilter : true;
      const byStatus = statusFilter ? (statusFilter === "Active" ? p.active : !p.active) : true;
      const byMin = minPrice ? p.price >= Number(minPrice) : true;
      const byMax = maxPrice ? p.price <= Number(maxPrice) : true;
      return byCategory && byStatus && byMin && byMax;
    });
  }, [products, categoryFilter, statusFilter, minPrice, maxPrice]);

  // feed filtered data to table by recreating instance when filters change
  const tableWithFilters = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select className="border rounded p-2 bg-transparent" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option>Electronics</option>
            <option>Furniture</option>
            <option>Clothing</option>
          </select>
          <select className="border rounded p-2 bg-transparent" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <input className="border rounded p-2 w-24 bg-transparent" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input className="border rounded p-2 w-24 bg-transparent" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <Button asChild>
            <a href="/dashboard/products/create">+ New Product</a>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={!!pendingDelete} onClose={() => setPendingDelete(null)}>
            <DialogHeader title="Delete product?" description={pendingDelete ? pendingDelete.name : undefined} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!pendingDelete) return;
                  const res = await fetch(`/api/products?id=${pendingDelete._id}`, { method: "DELETE" });
                  if (res.ok) {
                    show({ title: "Product deleted", variant: "success" });
                    setPendingDelete(null);
                    queryClient.invalidateQueries({ queryKey: ["products"] });
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
                {tableWithFilters.getHeaderGroups().map((hg) => (
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
                      <Loader label="Loading products" />
                    </TableCell>
                  </TableRow>
                ) : tableWithFilters.getRowModel().rows.length ? (
                  tableWithFilters.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
            <div className="text-sm text-gray-500">{filteredData.length} items</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => tableWithFilters.previousPage()} disabled={!tableWithFilters.getCanPreviousPage()}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => tableWithFilters.nextPage()} disabled={!tableWithFilters.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
