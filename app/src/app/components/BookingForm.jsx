"use client";
import { useState } from "react";

export default function BookingForm({ slot }) {
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState("MWF");
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();

    const formEl = e.currentTarget;

    setMsg(null);
    setLoading(true);

    const formData = new FormData(formEl);
    const payload = Object.fromEntries(formData.entries());

    let res;
    try {
      res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload, examType, 
          slotId: slot.slotId,
          departmentSlug: slot.departmentSlug,
        }),
      });
    } catch (err) {
      setLoading(false);
      setMsg("Network error. Please try again.");
      return;
    }

    setLoading(false);

    if (!res.ok) {
      const text = await res.text();
      setMsg(`Could not book: ${text}`);
      return;
    }

    setMsg("Booked! ✅");
    formEl.reset();
  }

  return (
    <form onSubmit={onSubmit} className="bf-card">
      <div className="bf-header">
        <h2>Book Appointment</h2>
        <p>Confirm your details below.</p>
      </div>

      <div className="bf-summary">
        <div>
          <span>Department:</span> <strong>{slot.departmentName}</strong>
        </div>
        <div>
          <span>When:</span>{" "}
          <strong>
            {slot.dateLabel} • {slot.timeLabel}
          </strong>
        </div>
        <div>
          <span>Where:</span> <strong>{slot.locationLabel}</strong>
        </div>
      </div>

      <div className="bf-grid">
        <label className="bf-field">
          <span>Full name *</span>
          <input name="name" required autoComplete="name" />
        </label>

        <label className="bf-field">
          <span>Email *</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <label className="bf-field">
          <span>Student ID (optional)</span>
          <input name="studentId" />
        </label>

        <div></div>
        <div className="bf-field bf-notes">
          <span>Exam Type *</span>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                name="examType"
                value="MWF"
                checked={examType === "MWF"}
                onChange={(e) => setExamType(e.target.value)}
              />
              MWF (50 min)
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="radio"
                name="examType"
                value="TTH"
                checked={examType === "TTH"}
                onChange={(e) => setExamType(e.target.value)}
              />
              TTH (75 min)
            </label>
          </div>
        </div>

        <label className="bf-field">
          <span>Course code {slot.requireCourseInfo ? "*" : "(optional)"}</span>
          <input
            name="courseCode"
            placeholder="CS-453"
            required={!!slot.requireCourseInfo}
          />
        </label>

        <label className="bf-field">
          <span>
            Instructor Email {slot.requireCourseInfo ? "*" : "(optional)"}
          </span>
          <input
            name="instructorEmail"
            placeholder="Pranshu.Gupta@desales.edu"
            type="email"
            required
            autoComplete="email"
          />
        </label>

        <label className="bf-field bf-notes">
          <span>Notes (optional)</span>
          <textarea name="notes" rows={4} />
        </label>
      </div>

      <button className="bf-button" disabled={loading} type="submit">
        {loading ? "Booking..." : "Confirm booking"}
      </button>

      {msg && <p className="bf-msg">{msg}</p>}
    </form>
  );
}
