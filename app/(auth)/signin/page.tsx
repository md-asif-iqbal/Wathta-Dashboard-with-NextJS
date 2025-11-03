"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      const redirect = params.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-lg shadow-sm border animate-in fade-in zoom-in-50 duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center text-2xl"><LogIn className="h-6 w-6" /> Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-11" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9 h-11" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
              {loading && <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
              Sign In
            </Button>
            <div className="text-sm text-center">
              No account? <Link className="underline" href="/signup">Sign up</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


