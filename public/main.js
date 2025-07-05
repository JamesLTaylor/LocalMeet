document.getElementById('helloBtn').addEventListener('click', async () => {
  const res = await fetch('/api/hello');
  const data = await res.json();
  document.getElementById('apiResponse').textContent = data.message;
});

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
        alert('Login successful!');
        document.getElementById('loginModal').style.display = 'none';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Error logging in');
    }
  });
}
