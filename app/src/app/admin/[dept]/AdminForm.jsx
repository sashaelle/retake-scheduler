"use client";

import { useState } from "react";

const DEPT_NAMES = {
  HS: "Homeland Security",
  CJ: "Criminal Justice",
  PS: "Psychology",
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
function buildTimeOptions(stepMinutes = 15, start = "09:00", end = "17:00") {
  const out = [];
  for (let cur = toMinutes(start); cur <= toMinutes(end); cur += stepMinutes) {
    out.push(toTime(cur));
  }
  return out;
}

export default function AdminForm({ dept }) {
  const [status, setStatus] = useState(null);

  const deptKey = String(dept || "");
  const deptName = DEPT_NAMES[deptKey] || dept;

  const timeOptions = buildTimeOptions(15, "09:00", "17:00");

  async function onSubmit(e) {
    e.preventDefault();

    const formEl = e.currentTarget;
    setStatus({ type: "loading", msg: "Creating..." });

    const form = new FormData(formEl);

    const sessionName = String(form.get("sessionName") || "").trim();
    const date = String(form.get("date") || "");
    const startTime = String(form.get("startTime") || "");
    const endTime = String(form.get("endTime") || "");
    const capacity = Number(form.get("capacity") || 1);

    if (!sessionName || !date || !startTime || !endTime) {
      setStatus({ type: "error", msg: "Missing required fields." });
      return;
    }

    const examType = String(form.get("examType") || "MWF");
    const step = examType === "MWF" ? 60 : 75;

    const times = buildTimes(startTime, endTime, step);

    if (times.length === 0) {
      setStatus({ type: "error", msg: "End time must be after start time." });
      return;
    }

    const payload = {
      dept: deptKey,
      sessionName,
      date,
      capacity,
      times,
    };

    try {
      const res = await fetch(`/api/data?dept=${encodeURIComponent(deptKey)}`, {
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
      formEl.reset();
    } catch (err) {
      setStatus({
        type: "error",
        msg: `Create failed: ${String(err?.message ?? err).slice(0, 200)}`,
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
          <select
            className="af-select"
            name="startTime"
            defaultValue="09:00"
            required
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="af-field">
          <span>End time</span>
          <select
            className="af-select"
            name="endTime"
            defaultValue="11:00"
            required
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="af-field af-full">
          <span>Exam Type</span>
          <select className="af-select" name="ExamType" defaultValue="15">
            <option value="MWF">MWF</option>
            <option value="TTH">TTH</option>
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
