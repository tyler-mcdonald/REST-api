const auth = require("basic-auth");
const bcrypt = require("bcrypt");
const { User } = require("../models");

/**
 * Provides basic authentication for a user by checking if credentials were provided and that credentials match a username/email and password.
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {function} next - the next keyword
 */
exports.authenticateUser = async (req, res, next) => {
  let message;
  const credentials = auth(req);

  // Credentials provided?
  if (credentials) {
    const user = await User.findOne({
      where: { emailAddress: credentials.name },
    });
    // Credentials match a user?
    if (user) {
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      // Password is correct?
      if (authenticated) {
        console.log(
          `Authenticated successful for ${user.firstName} ${user.lastName}`
        );
        req.currentUser = user;
      } else
        message = `Authenticated failed for ${user.firstName} ${user.lastName}`;
    } else message = `User not found for ${credentials.name}`;
  } else message = "Auth header was not found";

  if (message) {
    console.warn(message);
    res.status(401).json({ message: "Access denied" });
  } else next();
};
