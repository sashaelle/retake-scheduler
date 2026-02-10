import Link from "next/link";
import BookingForm from "@/components/BookingForm";

const DEPARTMENTS = [
  { key: "cs", name: "Computer Science" },
  { key: "math", name: "Mathematics" },
  { key: "bio", name: "Biology" },
];

export default function DevDashboard() {
  const demoSlot = {
    slotId: "demo-slot-1",
    departmentSlug: "cs",
    departmentName: "Computer Science",
    dateLabel: "Mon Feb 10",
    timeLabel: "11:00 AM – 2:00 PM",
    locationLabel: "Room 214",
    requireCourseInfo: true, // set false if you don’t want course/prof required
  };

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Developer Dashboard</h1>
      <p>Internal navigation for testing multiple departments.</p>

      <table style={{ marginTop: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", paddingRight: 16 }}>Department</th>
            <th style={{ textAlign: "left", paddingRight: 16 }}>Student</th>
            <th style={{ textAlign: "left", paddingRight: 16 }}>Admin</th>
            <th style={{ textAlign: "left" }}>API</th>
          </tr>
        </thead>
        <tbody>
          {DEPARTMENTS.map((d) => (
            <tr key={d.key}>
              <td style={{ paddingTop: 10, paddingRight: 16 }}>
                <strong>{d.key}</strong> — {d.name}
              </td>
              <td style={{ paddingTop: 10, paddingRight: 16 }}>
                <Link href={`/d/${d.key}`}>/d/{d.key}</Link>
              </td>
              <td style={{ paddingTop: 10, paddingRight: 16 }}>
                <Link href={`/admin/${d.key}`}>/admin/{d.key}</Link>
              </td>
              <td style={{ paddingTop: 10 }}>
                <a href={`/api/data?dept=${d.key}`}>/api/data?dept={d.key}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 18, opacity: 0.8 }}>
        To add departments later, edit the <code>DEPARTMENTS</code> list in this file.
      </p>

      {/* Booking Form Test */}
      <div style={{ marginTop: 28, maxWidth: 720 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Booking Form Test</h2>
        <p style={{ opacity: 0.8 }}>
          This is wired to <code>/api/bookings</code>.
        </p>
        <div style={{ marginTop: 12 }}>
          <BookingForm slot={demoSlot} />
        </div>
      </div>
    </main>
  );
}
