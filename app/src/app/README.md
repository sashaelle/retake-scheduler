# Frontend File Organization

### src/app

---

## admin/[dept]

### AdminForm.jsx

AdminForm contains the layout for the session creation

DEPT_NAME
- function toMinutes(t)
- function toTime(mins)
- function buildTimes(startTime, endTime, step)
- function buildTimeOptions(stepMinutes = 15, start = "09:00", end = "17:00")
- export default function AdminForm({ dept })
- async function onSubmit(e)

return (jsx)
Department, Session Name, Date, Capacity, Start Time, End Time, Exam Type

### page.jsx

Default page layout before form information

export default async function AdminDeptPage({ params })
Title: Admin Dashboard
Department:
Subtitle: Manage Appointments

## api

### bookings

### data

## components

### BookingForm.jsx

## d\[dept]

### page.jsx

## dev

### page.jsx

## retake\[slug]

### page.jsx

## global.css

## layout.jsx

## page.jsx
