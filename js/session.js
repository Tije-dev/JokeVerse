(function () {
  var protectedPages = {
    '/pages/main.html': 'main.html',
    '/pages/save.html': 'save.html',
  };

  function authFetch(path, options) {
    return fetch(path, {
      ...options,
      credentials: 'include',
    });
  }

  function getCurrentProtectedPage() {
    var pathname = (window.location.pathname || '').toLowerCase();
    return protectedPages[pathname] || null;
  }

  function redirectToLogin(nextPage) {
    var next = nextPage ? '?next=' + encodeURIComponent(nextPage) : '';
    window.location.replace('/pages/login.html' + next);
  }

  function logout() {
    authFetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
      .catch(function () {})
      .finally(function () {
        redirectToLogin();
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-action="logout"]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    });

    var userEl = document.getElementById('navUser');
    if (!userEl) {
      userEl = null;
    }

    var currentProtectedPage = getCurrentProtectedPage();
    authFetch('/api/auth/me')
      .then(function (res) {
        if (res.status === 401) {
          return { authenticated: false };
        }
        return res.json();
      })
      .then(function (data) {
        if (data && data.authenticated && data.user && userEl) {
          userEl.textContent = data.user.username || data.user.email || '';
          if (data.user.email) {
            userEl.setAttribute('title', data.user.email);
          }
          userEl.classList.remove('d-none');
          return;
        }
        if (currentProtectedPage) {
          redirectToLogin(currentProtectedPage);
        }
      })
      .catch(function () {});
  });
})();
