// --- DOMContentLoaded and UI setup functions ---
function setupMenuHandlers() {
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  const loginMenuItem = document.getElementById('loginMenuItem');
  // toggle visibility of menu
  menuBtn.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });
  // dismiss menu if clicked outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) {
      menu.style.display = 'none';
    }
  });
  loginMenuItem.querySelector('a').addEventListener('click', function (e) {
    if (e.target.textContent === 'Login') {
      e.preventDefault();
      document.getElementById('loginModal').style.display = 'block';
      menu.style.display = 'none';
    }
  });
  document.getElementById('closeLogin').onclick = function () {
    document.getElementById('loginModal').style.display = 'none';
  };
}

async function setMenuVisibility(signedInState, signedOutState, userType) {
  const userSignedInItems = document.querySelectorAll('.menu-user-signed-in');
  const userSignedOutItems = document.querySelectorAll('.menu-signed-out');
  const moderatorSignedInItems = document.querySelectorAll('.menu-moderator-signed-in');

  userSignedInItems.forEach((item) => {
    item.style.display = signedInState;
  });
  userSignedOutItems.forEach((item) => {
    item.style.display = signedOutState;
  });
  moderatorSignedInItems.forEach((item) => {
    item.style.display = ['MODERATOR', 'ADMIN'].includes(userType) ? signedInState : 'none';
  });
}

// Set the username and update what menu items are visible
// This is called on page load and after login/logout
async function setUserName() {
  const userNameDisplay = document.getElementById('userNameDisplay');

  const res = await fetch('/api/current-username');
  const data = await res.json();
  const name = data.name;
  const typeRes = await fetch('/api/current-user-type');
  const typeData = await typeRes.json();
  const userType = typeData.userType;
  if (name && name !== null) {
    userNameDisplay.textContent = name;
    userNameDisplay.style.display = 'inline-block';
    setMenuVisibility('block', 'none', userType);
  } else {
    setMenuVisibility('none', 'block', userType);
  }
}

function setupLogoutHandler() {
  const menu = document.getElementById('menu');
  document.getElementById('logoutMenuLink').onclick = async function (e) {
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
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('loginModal').style.display = 'none';
          window.dispatchEvent(new CustomEvent('user-logged-in', { detail: { name: username } }));
          setUserName();
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (err) {
        alert('Error logging in');
      }
    });
  }
}
// an async function to fetch location from postcode
async function lookupPostcode(postcode) {
  try {
    const locationPostcodeInput = document.getElementById('locationPostcode');

    if (!postcode || postcode.trim() == '') {
      const existingTooltip = locationPostcodeInput.parentNode.querySelector('.tooltip');
      if (existingTooltip) {
        existingTooltip.parentNode.removeChild(existingTooltip);
      }
      return null;
    }
    const res = await fetch(`/api/get-location-from-postcode?postcode=${postcode}`);
    const data = await res.json();
    const span = document.createElement('span');
    span.className = 'tooltip';
    span.style.backgroundSize = '20px';
    span.style.width = '20px';
    span.style.height = '20px';
    span.style.display = 'inline-block';
    span.style.verticalAlign = 'middle';
    span.style.marginLeft = '8px';

    const existingTooltip = locationPostcodeInput.parentNode.querySelector('.tooltip');
    if (existingTooltip) {
      existingTooltip.parentNode.removeChild(existingTooltip);
    }
    locationPostcodeInput.parentNode.insertBefore(span, locationPostcodeInput.nextSibling);
    if (data.success) {
      span.style.backgroundImage = "url('/resources/icons8-checkmark-40.png')";
      span.title = data.location.latitude + ', ' + data.location.longitude;
      return data.location;
    } else {
      span.style.backgroundImage = "url('/resources/icons8-error-40.png')";
      span.title = data.message || 'Error fetching location';
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
}

// --- Calendar and Event List functions ---
async function fetchCalendarEvents() {
  let events = [];
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = await res.json();
      events = data.map((event) => ({
        id: event.eventId,
        title: event.title,
        start: event.date,
        extendedProps: event,
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
    select: function (info) {
      window.dispatchEvent(
        new CustomEvent('calendar-range-select', {
          detail: {
            start: info.startStr,
            end: info.endStr,
          },
        })
      );
    },
    eventClick: function (info) {
      window.dispatchEvent(
        new CustomEvent('calendar-day-click', {
          detail: {
            date: info.event.startStr.split('T')[0],
            events: [info.event.extendedProps],
          },
        })
      );
    },
    dateClick: function (info) {
      const dayEvents = events.filter((e) => e.start.split('T')[0] === info.dateStr);
      window.dispatchEvent(
        new CustomEvent('calendar-day-click', {
          detail: {
            date: info.dateStr,
            events: dayEvents.map((e) => e.extendedProps),
          },
        })
      );
    },
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
        window.dispatchEvent(
          new CustomEvent('calendar-day-click', { detail: { date: event.date.split('T')[0], events: [event] } })
        );
      };
      ul.appendChild(li);
    }
    eventList.appendChild(ul);
  }
  listContainer.appendChild(eventList);
}

async function populateGroupTags() {
  await populateTags('groupTags', '/api/get-group-tags', 'Select groups...');
}

async function populateCategoryTags() {
  await populateTags('categoryTags', '/api/get-category-tags', 'Select categories...');
}

// --- Category Filter functions ---
async function populateTags(elementId, apiCall, msg) {
  const select = document.getElementById(elementId);
  if (!select) return;
  try {
    const res = await fetch(apiCall);
    if (res.ok) {
      const tags = await res.json();
      select.innerHTML = '';
      for (const tag of tags) {
        const option = document.createElement('option');
        option.value = tag.name;
        option.textContent = tag.name;
        option.title = tag.description || tag.name;
        select.appendChild(option);
        console.log('Adding tag:', tag.name);
      }
    }
    if (window.TomSelect) {
      if (select.tomselect) select.tomselect.destroy();
      new TomSelect(select, {
        plugins: ['remove_button'],
        maxItems: null,
        items: [],
        placeholder: msg,
        searchField: ['text'],
        closeAfterSelect: false,
        allowEmptyOption: true,
      });
    }
  } catch (err) {
    console.error('Error populating tags:', err);
  }
}

function filterEventsByCategory(events, selectedCategory) {
  if (!selectedCategory) return events;
  return events.filter((event) => {
    if (!event.categoryTags) return false;
    const tags = Array.isArray(event.categoryTags) ? event.categoryTags : String(event.categoryTags).split(';');
    return tags.includes(selectedCategory);
  });
}

function setupCategoryTags(events) {
  const select = document.getElementById('categoryTags');
  if (!select) return;
  select.addEventListener('change', () => {
    const selected = select.value;
    renderEventList(filterEventsByCategory(events, selected));
  });
}

async function fetchAndRenderEventList() {
  try {
    const userRes = await fetch('/api/current-user');
    if (userRes.ok) {
      const user = await userRes.json();
      console.log('Current user:', user);
    }
    const res = await fetch('/api/events');
    if (res.ok) {
      const events = await res.json();
      renderEventList(events);
      setupCategoryTags(events);
    }
  } catch {}
}

// Functions for Event Form
async function populateFormWithRecentEvent() {
  try {
    const res = await fetch('/api/my-most-recent-event');
    const result = await res.json();
    if (result.success && result.event) {
      const event = result.event;
      for (const key in event) {
        const el = document.getElementById(key);
        if (!el) continue;
        if (el.type === 'checkbox') {
          el.checked = event[key] === true || event[key] === 'true';
        } else if (el.type === 'date' && event[key]) {
          // Convert to yyyy-mm-dd for input[type=date]
          const d = new Date(event[key]);
          if (!isNaN(d)) {
            el.value = d.toISOString().slice(0, 10);
            // Also set time field if present
            const timeEl = document.getElementById('startTime');
            if (timeEl && d instanceof Date && !isNaN(d)) {
              // Pad hours/minutes to 2 digits
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              timeEl.value = `${hh}:${mm}`;
            }
          } else {
            el.value = '';
          }
        } else {
          el.value = event[key] || '';
        }
      }
      // Set eventId display
      document.getElementById('eventIdText').textContent = event.eventId || '';
    } else {
      // If no recent event, set eventId to current timestamp
      document.getElementById('eventIdText').textContent = Date.now();
      console.warn('No recent event found, setting eventId to current timestamp');
    }
  } catch (err) {
    // On error, set eventId to current timestamp if not already set
  }
}
async function setupForm() {
  console.log('Setting up event form');
  await populateCategoryTags();
  await populateGroupTags();
  await populateFormWithRecentEvent();
  // Ensure eventId is set on form creation if not populated
  if (!document.getElementById('eventIdText').textContent) {
    document.getElementById('eventIdText').textContent = Date.now();
  }
}

async function saveEvent() {
  const form = document.getElementById('eventForm');
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    // Convert checkboxes to boolean
    if (form.elements[key] && form.elements[key].type === 'checkbox') {
      data[key] = form.elements[key].checked;
    } else {
      data[key] = value;
    }
  });
  // POST to backend
  try {
    // Add eventId to data
    data.eventId = document.getElementById('eventIdText').textContent;
    const res = await fetch('/api/create-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      alert('Event saved successfully!');
      // Optionally redirect or reset form
    } else {
      alert(result.message || 'Error saving event');
    }
  } catch (err) {
    alert('Error saving event');
  }
}

// remove event from session
async function removeEventFromSession() {
  try {
    const res = await fetch('/api/remove-current-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (result.success) {
      console.log('Event removed from session');
    }
  } catch (err) {
    console.error('Error removing event from session', err);
  }
}
