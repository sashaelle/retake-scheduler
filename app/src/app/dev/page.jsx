"use client";

import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import BookingForm from "@/app/components/BookingForm";
=======
import BookingForm from "@/components/BookingForm";
>>>>>>> e15d1d15173404c82566796cd241e5ceea57dc44

const DEPARTMENTS = [
  { key: "cs", name: "Computer Science" },
  { key: "math", name: "Mathematics" },
  { key: "bio", name: "Biology" },
];

function toTimeLabel(t) {
  // t like "11:00" or "09:15"
  // Keep it simple for prototype: show as-is
  return t;
}

export default function DevDashboard() {
  const [dept, setDept] = useState("cs");
  const deptName = useMemo(
    () => DEPARTMENTS.find((d) => d.key === dept)?.name || dept,
    [dept]
  );

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState(null); // { dept, sessions }
  const [selected, setSelected] = useState(null); // slot object for BookingForm

  async function load() {
    setLoading(true);
    setMsg("");
    setSelected(null);

    try {
      const r = await fetch(`/api/data?dept=${encodeURIComponent(dept)}`);
      const text = await r.text();
      if (!r.ok) {
        setMsg(`Load failed (${r.status}): ${text}`);
        setData(null);
        return;
      }
      const json = JSON.parse(text);
      setData(json);
      setMsg(`Loaded ${json.sessions?.length || 0} session(s) for ${dept}.`);
    } catch (e) {
      setMsg(`Load failed: ${String(e)}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function createDemoSession() {
    setLoading(true);
    setMsg("");
    setSelected(null);

    // Simple demo values (change anytime)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const payload = {
      dept,
      sessionName: "Prototype 1 — Retake Block",
      date: `${yyyy}-${mm}-${dd}`,
      capacity: 3,
      times: ["11:00", "11:15", "11:30", "11:45"],
    };

    try {
      const r = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await r.text();
      if (!r.ok) {
        setMsg(`Create failed (${r.status}): ${text}`);
        return;
      }

      setMsg("Demo session created. Reloading…");
      await load();
    } catch (e) {
      setMsg(`Create failed: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load once on first render (optional)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessions = data?.sessions || [];

  return (
    <main style={{ padding: 20, fontFamily: "system-ui", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Prototype 1 — Dev Dashboard</h1>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        Controls for creating demo sessions, viewing slots, and booking.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 12,
          background: "#fff",
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ opacity: 0.8 }}>Department</span>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ccc" }}
            disabled={loading}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.key} — {d.name}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={load}
          disabled={loading}
          style={{
            padding: "9px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Working…" : "Load data"}
        </button>

        <button
          onClick={createDemoSession}
          disabled={loading}
          style={{
            padding: "9px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "#f7f7f7",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Create demo session
        </button>

        <span style={{ opacity: 0.75 }}>{msg}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, marginTop: 16 }}>
        {/* LEFT: Sessions + Slots */}
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 14,
            background: "#fff",
            minHeight: 200,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Slots ({deptName})</h2>

          {sessions.length === 0 ? (
            <p style={{ opacity: 0.75 }}>
              No sessions yet. Click <strong>Create demo session</strong>.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {sessions.map((s) => (
                <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.sessionName}</div>
                      <div style={{ opacity: 0.8, fontSize: 13 }}>{s.date}</div>
                    </div>
                    <div style={{ opacity: 0.75, fontSize: 13 }}>
                      capacity: <strong>{s.capacity}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                    {(s.slots || []).map((slot) => {
                      const remaining = Number(slot.remaining ?? 0);
                      const disabled = remaining <= 0;

                      const slotForForm = {
                        slotId: slot.id, // IMPORTANT: Java provides slot.id
                        departmentSlug: dept,
                        departmentName: deptName,
                        dateLabel: s.date,
                        timeLabel: toTimeLabel(slot.time),
                        locationLabel: "TBD (Prototype 1)",
                        requireCourseInfo: true, // change to false if you don't want course/prof required
                      };

                      return (
                        <div
                          key={slot.id || `${s.id}:${slot.time}`}
                          style={{ border: "1px solid #eee", borderRadius: 12, padding: 10, display: "grid", gap: 6 }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>{slot.time}</strong>
                            <span style={{ opacity: 0.8, fontSize: 13 }}>
                              remaining: <strong>{remaining}</strong>
                            </span>
                          </div>

                          <button
                            onClick={() => setSelected(slotForForm)}
                            disabled={disabled}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 10,
                              border: "1px solid #111",
                              background: disabled ? "#eee" : "#111",
                              color: disabled ? "#666" : "#fff",
                              cursor: disabled ? "not-allowed" : "pointer",
                              opacity: disabled ? 0.8 : 1,
                            }}
                          >
                            {disabled ? "Full" : "Book this slot"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RIGHT: Booking Form */}
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 14,
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Booking</h2>
          {!selected ? (
            <p style={{ opacity: 0.75 }}>Click “Book this slot” on the left to open the form.</p>
          ) : (
            <>
              <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ opacity: 0.8, fontSize: 13 }}>
                  Selected: <strong>{selected.dateLabel}</strong> • <strong>{selected.timeLabel}</strong>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    background: "#f7f7f7",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>

              <BookingForm slot={selected} />
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={load}
                  disabled={loading}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    background: "#f7f7f7",
                    cursor: "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Refresh slots
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
