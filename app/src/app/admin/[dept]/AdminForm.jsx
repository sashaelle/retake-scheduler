"use client";

import { useEffect, useState } from "react";

export default function AdminForm({ dept }) {
  const [sessionName, setSessionName] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [times, setTimes] = useState("09:00, 09:15, 09:30");

  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("");

  async function loadSessions() {
    setStatus("Loading sessions...");
    try {
      const res = await fetch(`/api/data?dept=${encodeURIComponent(dept)}`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setStatus("");
    } catch {
      setStatus("Failed to load sessions.");
    }
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Saving...");

    const slotTimes = times
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      dept,
      sessionName,
      date,
      capacity: Number(capacity),
      times: slotTimes,
    };

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`Error: ${data.error || "Unknown error"}`);
        return;
      }

      setStatus("Saved!");
      setSessionName("");
      // keep date/times/capacity as convenience, or clear if you want

      // Reload from the JSON store so what you see is what’s persisted
      await loadSessions();
    } catch {
      setStatus("Network/server error while saving.");
    }
  }

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Create a retake session</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Session name:
            <input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Calc 1 Retake"
              style={{ marginLeft: 8 }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ marginLeft: 8 }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Capacity per slot:
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              style={{ marginLeft: 8, width: 70 }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>
            Slot times (comma-separated):
            <input
              value={times}
              onChange={(e) => setTimes(e.target.value)}
              style={{ marginLeft: 8, width: 260 }}
            />
          </label>
        </div>

        <button type="submit">Create Session</button>
        <span style={{ marginLeft: 10 }}>{status}</span>
      </form>

      <hr style={{ margin: "16px 0" }} />

      <h3>Saved sessions (from JSON store)</h3>
      {sessions.length === 0 ? (
        <p>No sessions yet.</p>
      ) : (
        sessions.map((s) => (
          <div key={s.id} style={{ marginBottom: 12 }}>
            <strong>{s.sessionName}</strong> — {s.date} — cap {s.capacity}
            <ul>
              {s.slots.map((slot) => (
                <li key={slot.time}>
                  {slot.time} — {slot.remaining} remaining
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
