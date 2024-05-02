const session = require("express-session");

const checkLoggedIn = (req, res, next) => {
	if (req.session && req.session.user) {
		res.locals.user = req.session.user;
	}
	next();
};

module.exports = checkLoggedIn;
