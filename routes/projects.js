// routes/projects.js

const express = require("express");
const router = express.Router();
const mysql = require("mysql");

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

router.post("/", (req, res) => {
	const {
		naziv,
		opis,
		cijena,
		obavljeniPoslovi,
		datumPocetka,
		datumZavrsetka,
		leaderId,
	} = req.body;
	const project = {
		naziv,
		opis,
		cijena,
		obavljeniPoslovi,
		datumPocetka,
		datumZavrsetka,
		leader_id: leaderId,
	};
	connection.query("INSERT INTO projects SET ?", project, (err, result) => {
		if (err) {
			console.error("Error creating project:", err);
			res.status(500).json({ message: "Error creating project" });
			return;
		}
		res.status(201).json({
			message: "Project created successfully",
			id: result.insertId,
		});
	});
});

router.get("/", (req, res) => {
	connection.query("SELECT * FROM projects", (err, results) => {
		if (err) {
			console.error("Error fetching projects:", err);
			res.status(500).json({ message: "Error fetching projects" });
			return;
		}
		res.json(results);
	});
});

router.get("/:id", (req, res) => {
	const projectId = req.params.id;
	connection.query(
		"SELECT * FROM projects WHERE id = ?",
		projectId,
		(err, results) => {
			if (err) {
				console.error("Error fetching project:", err);
				res.status(500).json({ message: "Error fetching project" });
				return;
			}
			if (results.length === 0) {
				res.status(404).json({ message: "Project not found" });
				return;
			}
			res.json(results[0]);
		}
	);
});

router.put("/:id", (req, res) => {
	const projectId = req.params.id;
	const {
		naziv,
		opis,
		cijena,
		obavljeniPoslovi,
		datumPocetka,
		datumZavrsetka,
		leaderId,
	} = req.body;
	const project = {
		naziv,
		opis,
		cijena,
		obavljeniPoslovi,
		datumPocetka,
		datumZavrsetka,
		leader_id: leaderId,
	};
	connection.query(
		"UPDATE projects SET ? WHERE id = ?",
		[project, projectId],
		(err, result) => {
			if (err) {
				console.error("Error updating project:", err);
				res.status(500).json({ message: "Error updating project" });
				return;
			}
			res.json({ message: "Project updated successfully" });
		}
	);
});

router.delete("/:id", (req, res) => {
	const projectId = req.params.id;
	connection.query(
		"DELETE FROM projects WHERE id = ?",
		projectId,
		(err, result) => {
			if (err) {
				console.error("Error deleting project:", err);
				res.status(500).json({ message: "Error deleting project" });
				return;
			}
			res.json({ message: "Project deleted successfully" });
		}
	);
});

router.post("/:projectId/addMember/:userId", (req, res) => {
	const projectId = req.params.projectId;
	const userId = req.params.userId;
	connection.query(
		"INSERT INTO user_project (project_id, user_id) VALUES (?, ?)",
		[projectId, userId],
		(err, result) => {
			if (err) {
				console.error("Error adding member to project:", err);
				res.status(500).json({
					message: "Error adding member to project",
				});
				return;
			}
			res.json({ message: "Member added to project successfully" });
		}
	);
});

module.exports = router;
