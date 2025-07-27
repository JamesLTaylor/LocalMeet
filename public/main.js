/*
 * main.js - LocalMeet frontend logic
 *
 * All functions are grouped together for maintainability.
 * DOMContentLoaded and event listeners are at the bottom.
 */

// --- DOMContentLoaded and UI setup functions ---
function setupMenuHandlers() {
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const loginMenuItem = document.getElementById('loginMenuItem');
  menuBtn.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) {
      menu.style.display = 'none';
    }
  });
  loginMenuItem.querySelector('a').addEventListener('click', function(e) {
    if (e.target.textContent === 'Login') {
      e.preventDefault();
      document.getElementById('loginModal').style.display = 'block';
      menu.style.display = 'none';
    }
  });
  document.getElementById('closeLogin').onclick = function() {
    document.getElementById('loginModal').style.display = 'none';
  };
}

// Set the username and update what menu items are visible
// This is called on page load and after login/logout
async function setUserName() {
  const userNameDisplay = document.getElementById('userNameDisplay');
  const profileMenuItem = document.getElementById('profileMenuItem');
  const logoutMenuItem = document.getElementById('logoutMenuItem');
  const loginMenuItem = document.getElementById('loginMenuItem');
  const signupMenuItem = document.getElementById('signupMenuItem');
  const addEventMenuItem = document.getElementById('addEventMenuItem');

  const res = await fetch('/api/userName');
  const data = await res.json();
  const name = data.name;
  const typeRes = await fetch('/api/userType');
  const typeData = await typeRes.json();
  const userType = typeData.userType;
  if (name && name !== null) {
    userNameDisplay.textContent = name;
    userNameDisplay.style.display = 'inline-block';
    profileMenuItem.style.display = 'block';
    logoutMenuItem.style.display = 'block';
    loginMenuItem.style.display = 'none';
    signupMenuItem.style.display = 'none';
    if (userType && String(userType).toUpperCase() === 'ADMIN') {
      addEventMenuItem.style.display = 'block';
    } else {
      addEventMenuItem.style.display = 'none';
    }
  } else {
    userNameDisplay.textContent = '';
    userNameDisplay.style.display = 'none';
    profileMenuItem.style.display = 'none';
    logoutMenuItem.style.display = 'none';
    loginMenuItem.style.display = 'block';
    signupMenuItem.style.display = 'block';
    addEventMenuItem.style.display = 'none';
  }
}

function setupLogoutHandler() {
  const menu = document.getElementById('menu');
  document.getElementById('logoutMenuLink').onclick = async function(e) {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST' });
    setUserName();
    menu.style.display = 'none';
  };
}

function setupLoginFormHandler() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('loginModal').style.display = 'none';
          window.dispatchEvent(new CustomEvent('user-logged-in', { detail: { name: username } }));
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (err) {
        alert('Error logging in');
      }
    });
  }
}

// --- Calendar and Event List functions ---
async function fetchCalendarEvents() {
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
  return events;
}

function setupFullCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    events,
    selectable: true,
    select: function(info) {
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
}

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

// --- Category Filter functions ---
async function populateCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  try {
    const res = await fetch('/api/category-tags');
    if (res.ok) {
      const tags = await res.json();
      select.innerHTML = '';
      for (const tag of tags) {
        const option = document.createElement('option');
        option.value = tag.name;
        option.textContent = tag.name;
        option.title = tag.description || tag.name;
        select.appendChild(option);
      }
    }
    if (window.TomSelect) {
      if (select.tomselect) select.tomselect.destroy();
      new TomSelect(select, {
        plugins: ['remove_button'],
        maxItems: null,
        placeholder: 'Select categories...',
        searchField: ['text'],
        closeAfterSelect: false,
        allowEmptyOption: true
      });
    }
  } catch {}
}

function filterEventsByCategory(events, selectedCategory) {
  if (!selectedCategory) return events;
  return events.filter(event => {
    if (!event.categoryTags) return false;
    const tags = Array.isArray(event.categoryTags) ? event.categoryTags : String(event.categoryTags).split(';');
    return tags.includes(selectedCategory);
  });
}

function setupCategoryFilter(events) {
  const select = document.getElementById('categoryFilter');
  if (!select) return;
  select.addEventListener('change', () => {
    const selected = select.value;
    renderEventList(filterEventsByCategory(events, selected));
  });
}

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

// --- Event listeners and initialization ---
document.addEventListener('DOMContentLoaded', async function() {
  setupMenuHandlers();
  setUserName();
  setupLogoutHandler();
  setupLoginFormHandler();

  window.addEventListener('user-logged-in', () => {
    setUserName();
  });

  // Calendar
  const calendarEvents = await fetchCalendarEvents();
  setupFullCalendar(calendarEvents);

  // Event list and category filter
  fetchAndRenderEventList();
  populateCategoryFilter();
});

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
