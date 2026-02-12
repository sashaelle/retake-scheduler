import AdminForm from "./AdminForm";

export default async function AdminDeptPage({ params }) {
  const { dept } = await params;

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Department: <span className="dept">{dept}</span>
          </p>
        </header>

        <section className="admin-card">
          <h2 className="admin-section-title">Manage Appointments</h2>
          <AdminForm dept={dept} />
        </section>
      </div>
    </main>
  );
}
