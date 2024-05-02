var express = require("express");
var router = express.Router();
const checkLoggedIn = require("../middlewares/authMiddleware");
const session = require("express-session");

router.use(checkLoggedIn);
/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", {
		title: "Projects",
		isLoggedIn: req.session.user,
		userName: req.session.user ? req.session.user.name : null,
	});
});

module.exports = router;
