import { NextResponse } from "next/server";

const BACKEND = "http://localhost:8081";

export async function POST(req) {
  const body = await req.text();
  const r = await fetch(`${BACKEND}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
