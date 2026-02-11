import { NextResponse } from "next/server";

const BACKEND = "http://localhost:8081";

export async function GET(req) {
  const url = new URL(req.url);
  const dept = url.searchParams.get("dept") || "";

  const r = await fetch(`${BACKEND}/data?dept=${encodeURIComponent(dept)}`);
  const text = await r.text();

  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const body = await req.text();

  const r = await fetch(`${BACKEND}/data`, {
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
