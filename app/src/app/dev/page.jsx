"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookingForm from "@/app/components/BookingForm";

const DEPARTMENTS = [
  { key: "HS", name: "Homeland Security" },
  { key: "CJ", name: "Criminal Justice" },
  { key: "PS", name: "Psychology" },
];

function toTimeLabel(t) {
  return t;
}

export default function DevDashboard() {
  const [dept, setDept] = useState("HS");
  const deptName = useMemo(
    () => DEPARTMENTS.find((d) => d.key === dept)?.name || dept,
    [dept],
  );

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);

  // dev-only helpers
  const [showJson, setShowJson] = useState(false);

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
      const r = await fetch(`/api/data?dept=${encodeURIComponent(dept)}`, {
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

  async function copyJson() {
    try {
      const pretty = JSON.stringify(data ?? {}, null, 2);
      await navigator.clipboard.writeText(pretty);
      setMsg("Copied JSON to clipboard ✅");
    } catch {
      setMsg("Could not copy JSON (clipboard blocked).");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sessions = data?.sessions || [];

  // Change these to your real routes:
  const adminHref = `/admin/${dept}`;
  const studentHref = `/dept/${dept}`; // example (edit to match your real student route)

  return (
    <main className="dev-shell">
      <h1 className="dev-title">Prototype 1 — Dev Dashboard</h1>
      <p className="dev-subtitle">Developer view (debug + quick navigation).</p>

      <div className="dev-toolbar">
        <label className="dev-field">
          <span className="dev-label">Department</span>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="dev-select"
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
          className="dev-btn dev-btnPrimary"
        >
          {loading ? "Working…" : "Load data"}
        </button>

        <button
          onClick={createDemoSession}
          disabled={loading}
          className="dev-btn dev-btnGhost"
        >
          Create demo session
        </button>

        <button
          type="button"
          onClick={() => setShowJson((v) => !v)}
          className="dev-btn dev-btnGhost"
        >
          {showJson ? "Hide JSON" : "Show JSON"}
        </button>

        <Link href={`/admin/${dept}`} className="dev-btn dev-btnGhost">
          Open Admin page
        </Link>

        <a className="dev-btn dev-btnGhost" href={studentHref}>
          Open Student page
        </a>

        <span className="dev-msg">{msg}</span>
      </div>

      {/* Raw JSON Viewer */}
      {showJson && (
        <section className="dev-card" style={{ marginTop: 16 }}>
          <div className="dev-sessionHeader">
            <h2 className="dev-h2" style={{ margin: 0 }}>
              Raw JSON (dept: {dept})
            </h2>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={copyJson}
                className="dev-btn dev-btnGhost"
                disabled={!data}
              >
                Copy JSON
              </button>

              <button
                onClick={() => {
                  // quick “download” without server
                  const pretty = JSON.stringify(data ?? {}, null, 2);
                  const blob = new Blob([pretty], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `dept-${dept}-data.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="dev-btn dev-btnGhost"
                disabled={!data}
              >
                Download JSON
              </button>
            </div>
          </div>

          <pre
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #eee",
              background: "#fafafa",
              overflowX: "auto",
              maxHeight: 360,
            }}
          >
            {JSON.stringify(data ?? {}, null, 2)}
          </pre>
        </section>
      )}

      <div className="dev-grid">
        <section className="dev-card">
          <h2 className="dev-h2">Slots ({deptName})</h2>

          {sessions.length === 0 ? (
            <p className="dev-muted">
              No sessions yet. Click <strong>Create demo session</strong>.
            </p>
          ) : (
            <div className="dev-stack">
              {sessions.map((s) => (
                <div key={s.id} className="dev-session">
                  <div className="dev-sessionHeader">
                    <div>
                      <div className="dev-sessionTitle">{s.sessionName}</div>
                      <div className="dev-sessionMeta">{s.date}</div>
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
                        departmentSlug: dept,
                        departmentName: deptName,
                        dateLabel: s.date,
                        timeLabel: toTimeLabel(slot.time),
                        locationLabel: "TBD (Prototype 1)",
                        requireCourseInfo: true,
                      };

                      return (
                        <div key={slot.id} className="dev-slotCard">
                          <div className="dev-slotTop">
                            <strong>{slot.time}</strong>
                            <span className="dev-slotMeta">
                              remaining: <strong>{remaining}</strong>
                            </span>
                          </div>

                          <button
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
              ))}
            </div>
          )}
        </section>

        <section className="dev-card">
          <h2 className="dev-h2">Booking</h2>

          {!selected ? (
            <p className="dev-muted">
              Click “Book this slot” on the left to open the form.
            </p>
          ) : (
            <>
              <div className="dev-selectedRow">
                <div className="dev-selectedText">
                  Selected: <strong>{selected.dateLabel}</strong> •{" "}
                  <strong>{selected.timeLabel}</strong>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="dev-btn dev-btnGhost"
                >
                  Close
                </button>
              </div>

              <BookingForm slot={selected} />

              <div className="dev-actions">
                <Link href={`/admin/${dept}`} className="dev-btn dev-btnGhost">
                  Admin ({deptName})
                </Link>

                <Link href={`/dept/${dept}`} className="dev-btn dev-btnGhost">
                  Student View
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
