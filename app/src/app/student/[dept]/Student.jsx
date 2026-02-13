"use client";

import { useEffect, useState } from "react";
import BookingForm from "@/app/components/BookingForm";

const DEPT_NAMES = {
  HS: "Homeland Security",
  CJ: "Criminal Justice",
  PS: "Psychology",
};

function toTimeLabel(t) {
  return t;
}

function timeToMinutes(t) {
  const [hStr, mStr] = String(t).split(":");
  const h = Number(hStr);
  const m = Number(mStr ?? 0);
  return h * 60 + m;
}

function minutesTo12h(mins) {
  let h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;

  const ampm = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function sessionRange12h(slots = []) {
  const mins = (slots || [])
    .map((s) => s?.time)
    .filter(Boolean)
    .map(timeToMinutes)
    .sort((a, b) => a - b);

  if (mins.length === 0) return null;

  const step = mins.length >= 2 ? Math.max(1, mins[1] - mins[0]) : 15;

  const start = mins[0];
  const end = mins[mins.length - 1] + step;

  return { start: minutesTo12h(start), end: minutesTo12h(end) };
}

export default function Student({ dept }) {
  const deptKey = String(dept || "")
    .toUpperCase()
    .trim();
  const deptName = DEPT_NAMES[deptKey] || deptKey;

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    setMsg("");
    setSelected(null);

    try {
      const r = await fetch(`/api/data?dept=${encodeURIComponent(deptKey)}`, {
        cache: "no-store",
      });

      const text = await r.text();
      if (!r.ok) {
        setMsg(`Load failed (${r.status}): ${text}`);
        setSessions([]);
        return;
      }

      const json = JSON.parse(text);
      setSessions(json.sessions || []);
    } catch (e) {
      setMsg(`Load failed: ${String(e)}`);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptKey]);

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1 className="admin-title">Student Dashboard</h1>
          <p className="admin-subtitle">
            Department: <span className="admin-dept">{deptName}</span>
          </p>
        </header>

        <div className="dev-grid">
          <section className="dev-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h2 className="dev-h2" style={{ margin: 0 }}>
                Available Slots
              </h2>

              <button
                onClick={load}
                disabled={loading}
                className="dev-btn dev-btnGhost"
              >
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>

            {msg && <p className="dev-msg">{msg}</p>}

            {sessions.length === 0 ? (
              <p className="dev-muted">No sessions available right now.</p>
            ) : (
              <div className="dev-stack">
                {sessions.map((s) => {
                  const range = sessionRange12h(s.slots || []);

                  return (
                    <div key={s.id} className="dev-session">
                      <div className="dev-sessionHeader">
                        <div>
                          <div className="dev-sessionTitle">
                            {s.sessionName}
                          </div>
                          <div className="dev-sessionMeta">
                            {s.date}
                            {s.startTime && s.endTime
                              ? ` • ${s.startTime}–${s.endTime}`
                              : ""}
                          </div>
                        </div>
                        <div className="dev-sessionMeta">
                          capacity: <strong>{s.capacity}</strong>
                        </div>
                      </div>

                      <div className="dev-slots">
                        {(s.slots || []).map((slot) => {
                          const remaining = Number(slot.remaining ?? 0);
                          const disabled = remaining <= 0;

                          const slotForForm = {
                            slotId: slot.id,
                            departmentSlug: deptKey,
                            departmentName: deptName,
                            dateLabel: s.date,
                            timeLabel: toTimeLabel(slot.time),
                            locationLabel: "TBD",
                            requireCourseInfo: true,
                          };

                          return (
                            <div key={slot.id} className="dev-slotCard">
                              <div className="dev-slotTop">
                                <strong>{toTimeLabel(slot.time)}</strong>
                                <span className="dev-slotMeta">
                                  remaining: <strong>{remaining}</strong>
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelected(slotForForm)}
                                disabled={disabled}
                                className={
                                  "dev-btn dev-btnPrimary " +
                                  (disabled ? "dev-btnDisabled" : "")
                                }
                              >
                                {disabled ? "Full" : "Book this slot"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="dev-card">
            <h2 className="dev-h2">Booking</h2>

            {!selected ? (
              <p className="dev-muted">
                Choose a slot to open the booking form.
              </p>
            ) : (
              <>
                <div className="dev-selectedRow">
                  <div className="dev-selectedText">
                    Selected: <strong>{selected.dateLabel}</strong> •{" "}
                    <strong>{selected.timeLabel}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="dev-btn dev-btnGhost"
                  >
                    Close
                  </button>
                </div>

                <BookingForm slot={selected} />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
