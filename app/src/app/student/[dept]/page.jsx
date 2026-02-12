import BookingForm from "@/app/components/BookingForm";

const DEPT_NAMES = {
  HS: "Homeland Security",
  CJ: "Criminal Justice",
  PS: "Psychology",
};

export default async function StudentDeptPage({ params }) {
    const { dept } = await params;

    const deptKey = String(dept || "");
    const deptName = DEPT_NAMES[deptKey] || dept;

    return (
        <main className="admin-page">
        <div className="admin-container">
            <header className="admin-header">
            <h1 className="admin-title">Student Dashboard</h1>
            <p className="admin-subtitle">
                Department: <span className="dept">{deptName}</span>
            </p>
            </header>

            <section className="admin-card">
            <h2 className="admin-section-title">Book Appointments</h2>
            <BookingForm slot={deptName} />
            </section>
        </div>
        </main>
    );
}