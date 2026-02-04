export default async function AdminDeptPage({ params }) {
  const { dept } = await params;

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Admin Dashboard</h1>
      <p>Department: {dept}</p>

      {/* Next step: this is where we'll put a form to create sessions/slots */}
      <section style={{ marginTop: 16 }}>
        <h2>Create a retake session</h2>
        <p>(Coming next: form inputs for date, time slots, and capacity.)</p>
      </section>
    </main>
  );
}
