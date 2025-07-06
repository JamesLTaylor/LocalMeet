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
    selectable: true,
    select: function(info) {
      // info.startStr and info.endStr (exclusive)
      window.dispatchEvent(new CustomEvent('calendar-range-select', {
        detail: {
          start: info.startStr,
          end: info.endStr
        }
      }));
    },
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

function renderEventList(events) {
  const listContainer = document.getElementById('event-list');
  if (!listContainer) return;
  listContainer.innerHTML = '';
  const eventList = document.createElement('div');
  eventList.innerHTML = '<h2>Upcoming Events</h2>';
  if (!events || events.length === 0) {
    eventList.innerHTML += '<p>No events found.</p>';
  } else {
    const ul = document.createElement('ul');
    ul.className = 'event-list-ul';
    for (const event of events) {
      const li = document.createElement('li');
      li.className = 'event-list-item';
      li.innerHTML = `<strong>${event.title}</strong><br>
        <span>${new Date(event.date).toLocaleString()}</span><br>
        <span>${event.locationDescription || ''}</span>`;
      li.onclick = () => {
        window.dispatchEvent(new CustomEvent('calendar-day-click', { detail: { date: event.date.split('T')[0], events: [event] } }));
      };
      ul.appendChild(li);
    }
    eventList.appendChild(ul);
  }
  listContainer.appendChild(eventList);
}

// Fetch category tags and populate the filter dropdown
async function populateCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  try {
    const res = await fetch('/api/category-tags');
    if (res.ok) {
      const tags = await res.json();
      for (const tag of tags) {
        const option = document.createElement('option');
        option.value = tag.name;
        option.textContent = tag.name;
        option.title = tag.description || tag.name;
        select.appendChild(option);
      }
    }
  } catch {}
}

// Filter events by selected category
function filterEventsByCategory(events, selectedCategory) {
  if (!selectedCategory) return events;
  return events.filter(event => {
    if (!event.categoryTags) return false;
    const tags = Array.isArray(event.categoryTags) ? event.categoryTags : String(event.categoryTags).split(';');
    return tags.includes(selectedCategory);
  });
}

// Update event list when filter changes
function setupCategoryFilter(events) {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  select.addEventListener('change', () => {
    const selected = select.value;
    renderEventList(filterEventsByCategory(events, selected));
  });
}

// Patch fetchAndRenderEventList to support filtering
async function fetchAndRenderEventList() {
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const events = await res.json();
      renderEventList(events);
      setupCategoryFilter(events);
    }
  } catch {}
}

fetchAndRenderEventList();
populateCategoryFilter();

// Listen for calendar day clicks
window.addEventListener('calendar-day-click', (e) => {
  // e.detail.date, e.detail.events
  // You can update the UI to show event details for the selected day
  console.log('Clicked day:', e.detail.date, e.detail.events);
});

// Listen for calendar range selection
window.addEventListener('calendar-range-select', (e) => {
  // e.detail.start, e.detail.end
  // You can update the UI to show the selected range
  console.log('Selected range:', e.detail.start, 'to', e.detail.end);
});
