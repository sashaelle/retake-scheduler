// slots -- list
const slots = [ 
  // JavaScript array of objects
  // id = unique identifier
  // time = time slot label
  // remaining = remaining capacity
  // Fake hard-coded data -- will eventually come from JSON / API / database
  { id: 1, time: "9:00–9:15", remaining: 2 },
  { id: 2, time: "9:15–9:30", remaining: 0 },
  { id: 3, time: "9:30–9:45", remaining: 1 },
];

// defines React component RetakePage
// export default -- makes this the page for this route
// async allows use of "await"
export default async function RetakePage({ params }) {
  const { slug } = await params; // params passed by next.js -- waits for the params 
  // “This function controls the /retake/:slug URL.”
  // Ex: params.slug === "test"  (/retake/test)

  return (
    // wrapper -- semantic HTML tag
    // <main> represents the primary content of the page
    <main style={{ padding: 20, fontFamily: "system-ui" }}> 
      {/* Page Header */}
      <h1>Exam Retake Scheduler</h1> 
      {/* Session Identifier */}
      <p>Session: {slug}</p>

      <ul> {/* ul = "unordered list" ; makes list*/}
        {/* Render each time slot */}
        {/* .map() creates the <li> of elements */}
        {/* key helps React track list items efficiently */}
        {/* For each slot...*/}
        {slots.map((slot) => ( 
          <li key={slot.id} style={{ marginBottom: 8 }}> {/* Render 1 list item */}
                          {/* condition       ?          valueIfTrue     : valueIfFalse */}
            {slot.time} — {slot.remaining > 0 ? `${slot.remaining} left` : "FULL"}
            <button disabled={slot.remaining === 0} style={{ marginLeft: 8 }}> {/* Disable button if there are no slots remaining */}
              Book
            </button>
          </li> {/* Ends one list item */}
        ))}
      </ul> {/* End of unordered list */}
    </main>
  );
}
