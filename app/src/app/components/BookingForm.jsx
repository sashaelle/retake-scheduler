"use client";

import { useState } from "react";

export default function BookingForm({ slot }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        slotId: slot.slotId,
        departmentSlug: slot.departmentSlug,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const text = await res.text();
      setMsg(`Could not book: ${text}`);
      return;
    }

    setMsg("Booked! ✅");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border p-5 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Book Appointment</h2>
        <p className="opacity-70">Confirm your details below.</p>
      </div>

      <div className="rounded-xl border p-4 space-y-1">
        <div>
          <span className="opacity-70">Department:</span> {slot.departmentName}
        </div>
        <div>
          <span className="opacity-70">When:</span> {slot.dateLabel} •{" "}
          {slot.timeLabel}
        </div>
        <div>
          <span className="opacity-70">Where:</span> {slot.locationLabel}
        </div>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm opacity-80">Full name *</span>
          <input name="name" required className="border rounded-xl p-2" autoComplete="name" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">Email *</span>
          <input name="email" type="email" required className="border rounded-xl p-2" autoComplete="email" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">Student ID (optional)</span>
          <input name="studentId" className="border rounded-xl p-2" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">
            Course code {slot.requireCourseInfo ? "*" : "(optional)"}
          </span>
          <input
            name="courseCode"
            className="border rounded-xl p-2"
            placeholder="CS-360"
            required={!!slot.requireCourseInfo}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">
            Instructor {slot.requireCourseInfo ? "*" : "(optional)"}
          </span>
          <input
            name="instructor"
            className="border rounded-xl p-2"
            placeholder="Prof. Shimkanon"
            required={!!slot.requireCourseInfo}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm opacity-80">Notes (optional)</span>
          <textarea name="notes" rows={4} className="border rounded-xl p-2" />
        </label>
      </div>

      <button
        disabled={loading}
        className="rounded-xl border px-4 py-2 font-semibold disabled:opacity-60"
        type="submit"
      >
        {loading ? "Booking..." : "Confirm booking"}
      </button>

      {msg && <p className="text-sm opacity-80">{msg}</p>}
    </form>
  );
}
