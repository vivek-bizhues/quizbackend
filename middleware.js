const jwt = require('jsonwebtoken');
const User = require('./user'); // Import your User model

const authenticateMiddleware = async (req, res, next) => {
  // Extract the token from the request header or wherever it's stored
  const token = req.headers.authorization || '';

  try {
    // Verify the token
    const decoded = jwt.verify(token, 'hello');

    // If the token is valid, find the user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Attach the user object to the request for further use
    req.user = user;

    // Continue with the next middleware or route handler
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authenticateMiddleware;
