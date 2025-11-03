import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.blue.100/40),transparent_60%),radial-gradient(ellipse_at_bottom,theme(colors.indigo.100/30),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,theme(colors.blue.900/20),transparent_60%),radial-gradient(ellipse_at_bottom,theme(colors.indigo.900/10),transparent_60%)]" />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="animate-in fade-in slide-in-from-left-6 duration-300">
           
            <h1 className="mt-6 text-4xl font-bold tracking-tight">Manage Products and Orders with Ease</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Create products, place orders, and track your business performance. Clean UI, fast workflows, and responsive design.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="animate-in fade-in slide-in-from-right-2">
                <Link href="/signup">Get Started - Sign Up</Link>
              </Button>
              <Button asChild variant="outline" className="animate-in fade-in slide-in-from-right-4">
                <Link href="/signin">I already have an account</Link>
              </Button>
              <Button asChild variant="ghost" className="animate-in fade-in slide-in-from-right-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-4 bg-white/70 dark:bg-gray-950/50">
                <h3 className="font-medium">Quick Start</h3>
                <ol className="mt-2 list-decimal pl-4 text-sm text-muted-foreground">
                  <li>Sign up and sign in</li>
                  <li>Create your first product</li>
                  <li>Create an order and confirm totals</li>
                </ol>
              </div>
              <div className="rounded-lg border p-4 bg-white/70 dark:bg-gray-950/50">
                <h3 className="font-medium">What you can do</h3>
                <ul className="mt-2 list-disc pl-4 text-sm text-muted-foreground">
                  <li>Products: create, list, edit</li>
                  <li>Orders: create, list, edit</li>
                  <li>Dark mode, responsive UI</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-right-6 duration-300">
            <div className="rounded-xl border bg-white/70 p-6 shadow-sm dark:bg-gray-950/50">
              <h3 className="text-lg font-semibold">Where to go first</h3>
              <div className="mt-4 grid gap-3">
                <Link href="/dashboard/products/create" className="block rounded border p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <div className="font-medium">Create a Product</div>
                  <div className="text-sm text-muted-foreground">Add basic info, inventory and media</div>
                </Link>
                <Link href="/dashboard/orders/create" className="block rounded border p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <div className="font-medium">Create an Order</div>
                  <div className="text-sm text-muted-foreground">Select products, add shipping and review totals</div>
                </Link>
                <Link href="/dashboard/products" className="block rounded border p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <div className="font-medium">Browse Products</div>
                  <div className="text-sm text-muted-foreground">Filter, sort and manage your catalog</div>
                </Link>
                <Link href="/dashboard/orders" className="block rounded border p-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                  <div className="font-medium">View Orders</div>
                  <div className="text-sm text-muted-foreground">Track statuses, amounts and delivery progress</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
