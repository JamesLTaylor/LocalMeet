// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('loginModal').style.display = 'none';
        // Dispatch event to update user name in top bar
        window.dispatchEvent(new CustomEvent('user-logged-in', { detail: { name: email } }));
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Error logging in');
    }
  });
}

// FullCalendar integration
// Assumes FullCalendar JS and CSS are loaded in index.html

document.addEventListener('DOMContentLoaded', async function() {
  const calendarEl = document.getElementById('calendar');
  let events = [];
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      events = data.map(event => ({
        id: event.eventId,
        title: event.title,
        start: event.date,
        extendedProps: event
      }));
    }
  } catch {}
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    events,
    eventClick: function(info) {
      window.dispatchEvent(new CustomEvent('calendar-day-click', {
        detail: {
          date: info.event.startStr.split('T')[0],
          events: [info.event.extendedProps]
        }
      }));
    },
    dateClick: function(info) {
      // Find all events for this date
      const dayEvents = events.filter(e => e.start.split('T')[0] === info.dateStr);
      window.dispatchEvent(new CustomEvent('calendar-day-click', {
        detail: {
          date: info.dateStr,
          events: dayEvents.map(e => e.extendedProps)
        }
      }));
    }
  });
  calendar.render();
});

// Listen for calendar day clicks
window.addEventListener('calendar-day-click', (e) => {
  // e.detail.date, e.detail.events
  // You can update the UI to show event details for the selected day
  console.log('Clicked day:', e.detail.date, e.detail.events);
});
