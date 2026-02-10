async function getDeptData(dept) {
  const res = await fetch(`http://localhost:3000/api/data?dept=${encodeURIComponent(dept)}`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function DeptPage({ params }) {
  const { dept } = await params;
  const data = await getDeptData(dept);

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Student Booking</h1>
      <p>Department: {dept}</p>

      {data.sessions.length === 0 ? (
        <p>No retake sessions available yet.</p>
      ) : (
        data.sessions.map((s) => (
          <section key={s.id} style={{ marginTop: 16 }}>
            <h2>{s.sessionName}</h2>
            <p>Date: {s.date} — Capacity per slot: {s.capacity}</p>

            <ul>
              {s.slots.map((slot) => (
                <li key={slot.time}>
                  {slot.time} — {slot.remaining > 0 ? `${slot.remaining} remaining` : "FULL"}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
