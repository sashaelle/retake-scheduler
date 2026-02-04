"use client";

import { useState } from "react";

export default function AdminForm({ dept }) {
  const [sessionName, setSessionName] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [times, setTimes] = useState("09:00, 09:15, 09:30");
  const [sessions, setSessions] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();

    // turn "09:00, 09:15" into ["09:00","09:15"]
    const slotTimes = times
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newSession = {
      id: crypto.randomUUID(),
      dept,
      sessionName,
      date,
      capacity: Number(capacity),
      slots: slotTimes.map((t) => ({
        time: t,
        remaining: Number(capacity),
      })),
    };

    setSessions((prev) => [newSession, ...prev]);

    // optional: clear a couple fields after submit
    setSessionName("");
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
      </form>

      <hr style={{ margin: "16px 0" }} />

      <h3>Created sessions (in-memory)</h3>
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
