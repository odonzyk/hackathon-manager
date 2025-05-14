const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../logger");

// Middleware for checking the JSON Web Token
function authenticateToken(req, res, next) {
  let token = req.header("Authorization");
  if (typeof token !== "string" || !token.startsWith("Bearer ")) {
    logger.debug("Invalid Token");
    return res.status(403).send("Invalid Token");
  }
  token = token.slice(7);

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      logger.debug("Invalid Token");
      return res.status(403).send("Invalid Token");
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
