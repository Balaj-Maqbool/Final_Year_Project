function admin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Access denied! Admin privileges required.');
  }
  next();
}

module.exports = admin;
