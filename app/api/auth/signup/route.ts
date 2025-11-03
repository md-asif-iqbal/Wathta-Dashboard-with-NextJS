import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  await connectToDatabase();
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }
  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ message: "Email already used" }, { status: 409 });
  const user = await User.create({ name, email, password });
  return NextResponse.json({ _id: user._id, name: user.name, email: user.email }, { status: 201 });
}


