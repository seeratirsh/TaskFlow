// Check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Access Denied',
      message: 'Only admins can perform this action.'
    });
  }
  next();
};

module.exports = { isLoggedIn, isAdmin };