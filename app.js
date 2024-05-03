const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const projectRouter = require("./routes/projects");
const userRouter = require("./routes/users");
const homeRouter = require("./routes/index");

const app = express();
const generateSecretKey = () => {
	return crypto.randomBytes(32).toString("hex");
};
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	session({
		secret: generateSecretKey(),
		resave: false,
		saveUninitialized: true,
	})
);
app.set("view engine", "pug");

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

app.use("/", homeRouter);
app.use("/projects", projectRouter);
app.use("/users", userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
