# Frontend File Organization

### src/app

---

## admin/[dept]

### AdminForm.jsx

AdminForm contains the layout for the session creation and small helpers.

DEPT_NAME

- function toMinutes(t) // "HH:MM" -> minutes
- function toTime(mins) // minutes -> "HH:MM"
- function buildTimes(startTime, endTime, step) // array of times
- function buildTimeOptions(stepMinutes = 15, start = "09:00", end = "17:00") // options for select
- export default function AdminForm({ dept })
- async function onSubmit(e) // validates, posts to api/bookings

return (jsx)

- Fields: Department (read-only), Session Name, Date, Capacity, Start Time, End Time, Exam Type
- Validation: capacity > 0, start < end, date >= today
- Calls: POST `/api/bookings` with { dept, name, date, capacity, start, end, type }

### page.jsx

Default page layout wrapping the form and admin info.

- export default async function AdminDeptPage({ params })
- Title: Admin Dashboard
- Department: from params.dept
- Subtitle: Manage Appointments
- Data fetching: server component reads department metadata (optional)

---

## api

### bookings/route.js

- Handlers: GET (list), POST (create), DELETE (remove)
- Payloads:
  - POST body: { dept, name, date, capacity, start, end, type }
  - GET query: ?dept=DEPT&date=YYYY-MM-DD
- Responses: JSON, use standard HTTP codes

### data/route.js

- Serves: departments list, exam types, and dev fixtures
- `store.json` used as simple datastore in dev

---

## components

### BookingForm.jsx

- Purpose: Reusable booking form used by public pages and `retake/[slug]`.
- Props: `initialValues`, `onSubmit`, `readonlyDept?`
- Behavior: client-side validation, calls `api/bookings` POST

---

## d/[dept]

### page.jsx

- Public department page showing availability and booking UI
- Renders: Department info, available sessions, `BookingForm` where applicable

---

## dev

### page.jsx

- Quick utilities for local development: seed data, test links, debug UI

---

## retake/[slug]

### page.jsx

- Single retake/session detail + booking flow
- Behavior: fetch session by `slug`, prefill `BookingForm`, POST to `api/bookings`

---

## global.css

- Global styles, CSS variables, layout helpers

## layout.jsx

- App-wide layout, header/footer, providers (theme/auth)

## page.jsx

- Root landing page (overview, links to departments and admin)

---

Notes / Conventions

- Routes: folder-based (Next.js App Router)
- Data fetching: prefer server components at route-level
- Keep components focused; move helpers into small utility files if reused
- API routes: return JSON, clear status codes

```

```
