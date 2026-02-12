"use client";

import { useState } from "react";

const DEPT_NAMES = {
  hs: "Homeland Security",
  cj: "Criminal Justice",
  ps: "Psychology",
};

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function toTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}
function buildTimes(startTime, endTime, step) {
  const out = [];
  let cur = toMinutes(startTime);
  const end = toMinutes(endTime);
  while (cur < end) {
    out.push(toTime(cur));
    cur += step;
  }
  return out;
}

export default function AdminForm({ dept }) {
  const [status, setStatus] = useState(null);
  const deptName = DEPT_NAMES[dept] || dept;

  async function onSubmit(e) {
    e.preventDefault();

    const formEl = e.currentTarget; // grab it NOW
    setStatus({ type: "loading", msg: "Creating..." });

    const form = new FormData(formEl);
    // ...build payload...

    try {
      const res = await fetch(`/api/data?dept=${encodeURIComponent(dept)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      setStatus({
        type: "success",
        msg: `Created session with ${times.length} slots.`,
      });
      formEl.reset(); // use the captured element
    } catch (err) {
      setStatus({
        type: "error",
        msg: `Create failed: ${String(err?.message ?? err).slice(0, 200)}`,
      });
    }

    try {
      const res = await fetch(`/api/data?dept=${encodeURIComponent(dept)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      setStatus({
        type: "success",
        msg: `Created session with ${times.length} slots.`,
      });
      e.currentTarget.reset();
    } catch (err) {
      setStatus({
        type: "error",
        msg: `Create failed: ${String(err.message).slice(0, 200)}`,
      });
    }
  }

  return (
    <form className="af-form" onSubmit={onSubmit}>
      <div className="af-grid">
        <label className="af-field">
          <span>Department</span>
          <input className="af-input" value={deptName} readOnly />
        </label>

        <label className="af-field">
          <span>Session name</span>
          <input
            className="af-input"
            name="sessionName"
            placeholder="e.g., Resume Reviews"
            required
          />
        </label>

        <label className="af-field">
          <span>Date</span>
          <input className="af-input" type="date" name="date" required />
        </label>

        <label className="af-field">
          <span>Capacity</span>
          <input
            className="af-input"
            type="number"
            name="capacity"
            min="1"
            defaultValue="1"
            required
          />
        </label>

        <label className="af-field">
          <span>Start time</span>
          <input
            className="af-input"
            type="time"
            name="startTime"
            step="900"
            required
          />
        </label>

        <label className="af-field">
          <span>End time</span>
          <input className="af-input" type="time" name="endTime" required />
        </label>

        <label className="af-field af-full">
          <span>Slot length (minutes)</span>
          <select className="af-select" name="slotMinutes" defaultValue="15">
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
        </label>
      </div>

      <div className="af-actions">
        <button
          className="dev-btn dev-btnPrimary"
          type="submit"
          disabled={status?.type === "loading"}
        >
          {status?.type === "loading" ? "Creating..." : "Create session"}
        </button>
        <button className="dev-btn dev-btnGhost" type="reset">
          Reset
        </button>
        <p className="af-msg">
          {status
            ? status.msg
            : "Creates a session and generates time slots automatically."}
        </p>
      </div>
    </form>
  );
}
