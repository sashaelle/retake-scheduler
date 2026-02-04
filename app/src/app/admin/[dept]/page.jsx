import AdminForm from "./AdminForm";

export default async function AdminDeptPage({ params }) {
  const { dept } = await params;

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Admin Dashboard</h1>
      <p>Department: {dept}</p>

      <AdminForm dept={dept} />
    </main>
  );
}
