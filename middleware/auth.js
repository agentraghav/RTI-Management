const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      res.status(400).json({ msg: 'No authentication token,access denied' });
    }
    const verified = jwt.verify(token, process.env.SECRET);
    if (!verified) {
      res.status(400).json({ msg: 'Token verification failed,access denied' });
    }
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = auth;