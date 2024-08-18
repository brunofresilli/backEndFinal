
const authorize = (...allowedRoles) => (req, res, next) => {
  const { role } = req.user;
  if (allowedRoles.includes(role)) {
      return next();
  }
  res.redirect("/unauthorized");
};

module.exports = authorize;
