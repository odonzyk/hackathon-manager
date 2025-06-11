const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../logger');
const { RoleTypes, ErrorMsg } = require('../constants');

const rolesHierarchy = [RoleTypes.ADMIN, RoleTypes.MANAGER, RoleTypes.USER, RoleTypes.GUEST, RoleTypes.NEW, RoleTypes.DUMMY];

// Middleware for checking the JSON Web Token
function authenticateToken(req, res, next) {
  let token = req.header('Authorization');
  if (typeof token !== 'string' || !token.startsWith('Bearer ')) {
    logger.debug('Invalid Token');
    return res.status(403).send('Invalid Token');
  }
  token = token.slice(7);

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      logger.debug('Invalid Token');
      return res.status(403).send('Invalid Token');
    }
    req.user = user;
    next();
  });
}

function authenticateAndAuthorize(requiredRole) {
  return (req, res, next) => {
    let token = req.header('Authorization');
    if (typeof token !== 'string' || !token.startsWith('Bearer ')) {
      logger.debug('Invalid Token');
      return res.status(403).send(ErrorMsg.AUTH.INVALID_TOKEN);
    }
    token = token.slice(7);

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        logger.debug('Invalid Token');
        return res.status(403).send(ErrorMsg.AUTH.INVALID_TOKEN);
      }

      const userRole = user.role;
      if (!checkPermissions(userRole, requiredRole)) {
        logger.debug(`User ${user.username} with role ${userRole} does not have permission for ${requiredRole}`);
        return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
      }

      req.user = user;
      next();
    });
  };
}

const checkPermissions = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  return rolesHierarchy.indexOf(userRole) <= rolesHierarchy.indexOf(requiredRole);
};

module.exports = { authenticateToken, checkPermissions, authenticateAndAuthorize };
