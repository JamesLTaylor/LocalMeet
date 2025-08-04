/*
 * main.js - LocalMeet frontend logic
 *
 * DOMContentLoaded and event listeners are at the bottom.
 */

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
  populateCategoryTags();
  populateGroupTags();
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
