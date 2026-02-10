import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

async function readStore() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    // If file doesn't exist or is invalid, fall back to empty store
    return { departments: {} };
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

// GET /api/data?dept=cs
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dept = (searchParams.get("dept") || "").trim().toLowerCase();

  if (!dept) {
    return NextResponse.json(
      { error: "Missing ?dept=..." },
      { status: 400 }
    );
  }

  const store = await readStore();
  const deptData = store.departments[dept] || { sessions: [] };

  return NextResponse.json({ dept, sessions: deptData.sessions });
}

// POST /api/data
// Body: { dept, sessionName, date, capacity, times: ["09:00","09:15"] }
export async function POST(request) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const dept = (body.dept || "").trim().toLowerCase();
  const sessionName = (body.sessionName || "").trim();
  const date = (body.date || "").trim();
  const capacity = Number(body.capacity);
  const times = Array.isArray(body.times) ? body.times : [];

  if (!dept || !sessionName || !date || !Number.isFinite(capacity) || capacity < 1 || times.length === 0) {
    return NextResponse.json(
      { error: "Required: dept, sessionName, date, capacity>=1, times[]" },
      { status: 400 }
    );
  }

  const cleanedTimes = times.map(t => String(t).trim()).filter(Boolean);
  if (cleanedTimes.length === 0) {
    return NextResponse.json({ error: "times[] is empty" }, { status: 400 });
  }

  const store = await readStore();
  if (!store.departments[dept]) store.departments[dept] = { sessions: [] };

  const newSession = {
    id: crypto.randomUUID(),
    sessionName,
    date,
    capacity,
    slots: cleanedTimes.map((t) => ({
      time: t,
      remaining: capacity
    }))
  };

  store.departments[dept].sessions.unshift(newSession);
  await writeStore(store);

  return NextResponse.json({ ok: true, created: newSession });
}
