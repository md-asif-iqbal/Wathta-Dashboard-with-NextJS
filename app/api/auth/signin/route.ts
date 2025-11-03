import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  await connectToDatabase();
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ message: "Missing" }, { status: 400 });
  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set("auth_token", user._id.toString(), { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set("auth_name", user.name, { sameSite: "lax", path: "/" });
  return NextResponse.json({ _id: user._id, name: user.name, email: user.email });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_name");
  return NextResponse.json({ ok: true });
}


