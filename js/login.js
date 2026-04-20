(function () {
  const API_BASE =
    typeof window.__JOKEVERSE_API__ === 'string'
      ? window.__JOKEVERSE_API__.replace(/\/$/, '')
      : (function () {
          const { protocol, hostname, port } = window.location;
          const p = port || (protocol === 'https:' ? '443' : '80');
          if (p === '3000') return '';
          return `${protocol}//${hostname}:3000`;
        })();

  async function readJson(res) {
    const text = await res.text();
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const hint =
        res.status === 404
          ? ' Not found — is the Node server running on port 3000, and is the URL correct?'
          : '';
      throw new Error(`Unexpected response (${res.status}).${hint}`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned invalid JSON.');
    }
  }

  function authFetch(path, options) {
    const url = `${API_BASE}${path}`;
    return fetch(url, {
      ...options,
      credentials: 'include',
    });
  }

  /** Where to go after login or signup. Optional: login.html?next=save.html */
  function getPostAuthRedirect() {
    var allowed = {
      'main.html': '/pages/main.html',
      'save.html': '/pages/save.html',
    };
    var params = new URLSearchParams(window.location.search);
    var next = params.get('next');
    if (next && allowed[next]) {
      return allowed[next];
    }
    return '/pages/main.html';
  }

  document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in...';

    try {
      const res = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await readJson(res);

      if (data.success) {
        window.location.href = getPostAuthRedirect();
        return;
      }
      alert(data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Network error. Please try again.');
    }
    btn.disabled = false;
    btn.textContent = 'Login';
  });

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const toggleAuth = document.getElementById('toggleAuth');
  const formTitle = document.getElementById('formTitle');
  const toggleText = document.getElementById('toggleText');
  let isLogin = true;
  if (window.location.search.includes('signup=1')) {
    isLogin = false;
    loginForm.style.display = 'none';
    signupForm.style.display = '';
    formTitle.textContent = 'Sign Up';
    toggleText.textContent = 'Already have an account?';
    toggleAuth.textContent = 'Login';
  }
  toggleAuth.addEventListener('click', function () {
    isLogin = !isLogin;
    if (isLogin) {
      loginForm.style.display = '';
      signupForm.style.display = 'none';
      formTitle.textContent = 'Login';
      toggleText.textContent = "Don't have an account?";
      toggleAuth.textContent = 'Sign Up';
    } else {
      loginForm.style.display = 'none';
      signupForm.style.display = '';
      formTitle.textContent = 'Sign Up';
      toggleText.textContent = 'Already have an account?';
      toggleAuth.textContent = 'Login';
    }
  });

  document.getElementById('toggleLoginPassword').addEventListener('click', function () {
    const pwd = document.getElementById('loginPassword');
    if (pwd.type === 'password') {
      pwd.type = 'text';
      this.classList.remove('fa-eye');
      this.classList.add('fa-eye-slash');
    } else {
      pwd.type = 'password';
      this.classList.remove('fa-eye-slash');
      this.classList.add('fa-eye');
    }
  });
  document.getElementById('toggleSignupPassword').addEventListener('click', function () {
    const pwd = document.getElementById('signupPassword');
    if (pwd.type === 'password') {
      pwd.type = 'text';
      this.classList.remove('fa-eye');
      this.classList.add('fa-eye-slash');
    } else {
      pwd.type = 'password';
      this.classList.remove('fa-eye-slash');
      this.classList.add('fa-eye');
    }
  });

  (async function redirectIfAuthenticated() {
    try {
      const res = await authFetch('/api/auth/me');
      const data = await readJson(res);
      if (data.success && data.authenticated) {
        window.location.replace(getPostAuthRedirect());
      }
    } catch (_) {
      /* stay on login */
    }
  })();

  document.getElementById('signupForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing Up...';
    try {
      const res = await authFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await readJson(res);
      if (data.success) {
        window.location.href = getPostAuthRedirect();
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert(err.message || 'Network error. Please try again.');
    }
    btn.disabled = false;
    btn.textContent = 'Sign Up';
  });
})();
