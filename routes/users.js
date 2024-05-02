var express = require("express");
var router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const checkLoggedIn = require("../middlewares/authMiddleware");
const session = require("express-session");

router.use(checkLoggedIn);

const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "projects",
});

connection.connect((err) => {
	if (err) {
		console.error("Error connecting to MySQL database:", err);
		return;
	}
	console.log("Connected to MySQL database");
});

router.get("/login", function (req, res, next) {
	if (!req.user) {
		res.render("users/login", {
			title: "Login",
		});
	} else {
		res.redirect("/");
	}
});

router.get("/register", function (req, res, next) {
	if (!req.user) {
		res.render("users/register", {
			title: "Register",
		});
	} else {
		res.redirect("/");
	}
});

router.post("/logout", function (req, res, next) {
	req.session.destroy(function (err) {
		if (err) {
			console.error("Error logging out:", err);
			return next(err);
		}
		res.redirect("/");
	});
});

router.post("/register", async function (req, res, next) {
	const { name, email, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = { name, email, password: hashedPassword };

		connection.query("INSERT INTO users SET ?", user, (err, result) => {
			if (err) {
				console.error("Error registering user:", err);
				res.render("error", {
					title: "Error",
					errorMessage: "An error occurred while registering user.",
				});
				return;
			}
		});

		res.redirect("/");
	} catch (error) {
		console.error("Error hashing password:", error);
		res.status(500).json({ message: "Error hashing password" });
	}
});

router.post("/login", async function (req, res, next) {
	const { email, password } = req.body;
	try {
		connection.query(
			"SELECT * FROM users WHERE email = ?",
			[email],
			async (err, results) => {
				if (err) {
					console.error("Error logging in:", err);
					res.render("error", {
						title: "Error",
						errorMessage: "An error occurred while logging in.",
					});
					return;
				}
				if (results.length === 0) {
					res.render("users/login", {
						title: "Login",
						errorMessage: "Incorrect email or password!",
					});
					return;
				}
				const user = results[0];
				const passwordMatch = await bcrypt.compare(
					password,
					user.password
				);
				if (!passwordMatch) {
					res.render("users/login", {
						title: "Login",
						errorMessage: "Incorrect email or password!",
					});
					return;
				}
				req.session.user = { name: user.name, email: user.email };
				res.redirect("/");
			}
		);
	} catch (error) {
		console.error("Error comparing passwords:", error);
		res.render("error", {
			title: "Error",
			errorMessage: "An error occurred while logging in.",
		});
	}
});

router.get("/", function (req, res, next) {
	connection.query("SELECT name, email FROM users", (err, results) => {
		if (err) {
			console.error("Error fetching users:", err);
			res.status(500).json({ message: "Error fetching users" });
			return;
		}
		res.json(results);
	});
});

module.exports = router;
