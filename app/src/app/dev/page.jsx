import Link from "next/link";

const DEPARTMENTS = [
  { key: "cs", name: "Computer Science" },
  { key: "math", name: "Mathematics" },
  { key: "bio", name: "Biology" },
];

export default function DevDashboard() {
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
    </main>
  );
}
