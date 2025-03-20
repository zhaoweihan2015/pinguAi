import db from "@/db/db";
import { NextResponse } from "next/server";

export async function GET() {
  await db.read();

  const memory = db.data.memory;

  return NextResponse.json({ memory });
}

export async function POST(request: Request) {
  const { memory } = await request.json();
  await db.read();
  
  db.data.memory = memory;
  
  await db.write();

  return NextResponse.json({
    message: "success",
  });
}
