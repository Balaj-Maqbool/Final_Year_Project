function freelancer(req, res, next) {
  if (req.user.role !== 'freelancer') {
    return res.status(403).send('Access denied! Freelancer access only.');
  }
  next();
}

module.exports = freelancer;
