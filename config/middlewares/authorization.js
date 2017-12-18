const jwt = require('jsonwebtoken');
require('dotenv').config();

const Secret = process.env.JWT_SECRET;
/**
 * Generic require login routing middleware
 */
exports.secureLogin = function (req, res, next) {
  const token = req.body.token || req.headers['x-token'] || req.params.token;
  if (token) {
    jwt.verify(token, Secret, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: 'You do not have Permission to this Page' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No token provided' });
  }
};

/**
 * User authorizations routing middleware
 */
exports.user = {
  hasAuthorization(req, res, next) {
    if (req.profile.id !== req.user.id) {
      return res.send(401, 'User is not authorized');
    }
    next();
  }
};

