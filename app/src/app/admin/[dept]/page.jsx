import AdminForm from "./AdminForm";

const DEPT_NAMES = {
  HS: "Homeland Security",
  CJ: "Criminal Justice",
  PS: "Psychology",
}; 

export default async function AdminDeptPage({ params }) {
  const { dept } = await params;
  
  const deptKey = String(dept || "");
  const deptName = DEPT_NAMES[deptKey] || dept;

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Department: <span className="dept">{deptName}</span>
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
