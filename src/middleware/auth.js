const path = require('path');

function getSessionUser(req) {
  if (!req.session) {
    return null;
  }
  if (req.session.user && req.session.user.id) {
    return req.session.user;
  }
  // Backward compatibility with older flat session keys
  if (req.session.userId) {
    return {
      id: req.session.userId,
      username: req.session.username || null,
      email: req.session.email || null,
    };
  }
  return null;
}

/**
 * API routes: respond with 401 JSON when there is no authenticated session.
 */
function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: 'You must be logged in.' });
    return;
  }
  req.authUser = user;
  next();
}

/**
 * HTML pages: redirect to login with ?next=<basename> so the client can return after sign-in.
 */
function requirePageAuth(req, res, next) {
  const user = getSessionUser(req);
  if (user) {
    req.authUser = user;
    next();
    return;
  }
  const basename = path.basename(req.path || 'main.html');
  res.redirect(302, `/pages/login.html?next=${encodeURIComponent(basename)}`);
}

function setSessionUser(req, user) {
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

function clearSessionUser(req) {
  if (req.session) {
    delete req.session.user;
    delete req.session.userId;
    delete req.session.username;
    delete req.session.email;
  }
}

module.exports = {
  getSessionUser,
  requireAuth,
  requirePageAuth,
  setSessionUser,
  clearSessionUser,
};
