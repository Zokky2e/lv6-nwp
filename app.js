const express = require("express");
const mysql = require("mysql");
const projectRouter = require("./routes/projects");

const app = express();
app.use(express.json());

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

app.use("/projects", projectRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
