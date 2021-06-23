const jwt = require('jsonwebtoken');

const notAuth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      next();
    }
    res.redirect('/');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = notAuth;