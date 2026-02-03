const slots = [
  { id: 1, time: "9:00–9:15", remaining: 2 },
  { id: 2, time: "9:15–9:30", remaining: 0 },
  { id: 3, time: "9:30–9:45", remaining: 1 },
];

export default async function RetakePage({ params }) {
  const { slug } = await params;

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Exam Retake Scheduler</h1>
      <p>Session: {slug}</p>

      <ul>
        {slots.map((slot) => (
          <li key={slot.id} style={{ marginBottom: 8 }}>
            {slot.time} — {slot.remaining > 0 ? `${slot.remaining} left` : "FULL"}
            <button disabled={slot.remaining === 0} style={{ marginLeft: 8 }}>
              Book
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
