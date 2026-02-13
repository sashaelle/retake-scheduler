import Student from "./Student";

const DEPT_NAMES = {
  HS: "Homeland Security",
  CJ: "Criminal Justice",
  PS: "Psychology",
};

export default async function StudentDeptPage({ params }) {
  const { dept } = await params;

  const deptKey = String(dept || "").toLowerCase();
  const deptName = DEPT_NAMES[deptKey] || deptKey;

  return <Student dept={dept} />;
}