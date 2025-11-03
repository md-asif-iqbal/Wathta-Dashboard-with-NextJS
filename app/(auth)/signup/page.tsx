"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, Mail, Lock, User as UserIcon } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      router.push("/signin");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.green.100/40),transparent_60%),radial-gradient(ellipse_at_bottom,theme(colors.teal.100/30),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,theme(colors.green.900/20),transparent_60%),radial-gradient(ellipse_at_bottom,theme(colors.teal.900/10),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-6xl grid gap-8 p-6 md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-center animate-in fade-in slide-in-from-left-6 duration-300">
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Start managing your products and orders with a delightful experience.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-4">Free to try • Fast setup</div>
            <div className="rounded-lg border p-4">Clean UI • Great UX</div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Card className="w/full max-w-md shadow-sm border animate-in fade-in slide-in-from-right-6 duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Create an account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading && <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                  Sign Up
                </Button>
                <div className="text-sm text-center">
                  Already have an account? <Link className="underline" href="/signin">Sign in</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


