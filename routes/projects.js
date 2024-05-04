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

router.get("/new-project", (req, res) => {
	res.render("projects/form-projects", { title: "Add New Project" });
});

router.post("/new", (req, res) => {
	if (req.session && req.session.user) {
		const userId = req.session.user.id;
		console.log(req.session.user);
		const {
			naziv_projekta,
			opis_projekta,
			cijena_projekta,
			datum_pocetka,
			datum_zavrsetka,
		} = req.body;
		const project = {
			naziv_projekta,
			opis_projekta,
			cijena_projekta,
			datum_pocetka,
			datum_zavrsetka,
			leader_id: userId,
			created_at: new Date(),
			updated_at: new Date(),
		};
		connection.query(
			"INSERT INTO projects SET ?",
			project,
			(err, result) => {
				if (err) {
					console.error("Error creating project:", err);

					return;
				}
				res.redirect("/projects/my");
			}
		);
	} else {
		res.redirect("/");
	}
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

router.get("/my", (req, res) => {
	if (req.session && req.session.user) {
		const userId = req.session.user.id;
		connection.query(
			`
            SELECT projects.id, projects.naziv_projekta, projects.opis_projekta, projects.cijena_projekta, projects.datum_pocetka, projects.datum_zavrsetka
            FROM projects
            WHERE projects.leader_id = ?
        `,
			[userId],
			(err, results) => {
				if (err) {
					console.error("Error fetching projects:", err);
					res.status(500).json({
						message: "Error fetching projects",
					});
					return;
				}
				const formattedProjects = results.map((project) => ({
					id: project.id,
					naziv_projekta: project.naziv_projekta,
					opis_projekta: project.opis_projekta,
					obavljeni_poslovi: project.obavljeni_poslovi,
					cijena_projekta: project.cijena_projekta,
					datum_pocetka: project.datum_pocetka,
					datum_zavrsetka: project.datum_zavrsetka,
				}));
				getAvailableUsers(userId, (err, availableUsers) => {
					if (err) {
						res.status(500).json({
							message: "Error fetching available users",
						});
						return;
					}
					res.render("projects/my-projects", {
						title: "My Projects",
						projects: formattedProjects,
						availableUsers: availableUsers,
					});
				});
			}
		);
	} else {
		res.redirect("/");
	}
});

function getAvailableUsers(userId, callback) {
	connection.query(
		`
        SELECT * FROM users
        WHERE id != ?
    `,
		[userId],
		(err, results) => {
			if (err) {
				console.error("Error fetching available users:", err);
				callback(err, null);
				return;
			}
			callback(null, results);
		}
	);
}

router.get("/assigned", (req, res) => {
	if (req.session && req.session.user) {
		const userId = req.session.user.id;
		connection.query(
			`
			SELECT 	projects.id, projects.naziv_projekta, 
					projects.opis_projekta,	projects.obavljeni_poslovi, 
					projects.datum_pocetka, projects.datum_zavrsetka
			from projects
			inner join project_user on project_user.project_id = projects.id
			where project_user.user_id = ?
			`,
			[userId],
			(err, results) => {
				if (err) {
					console.error("Error fetching projects:", err);
					res.status(500).json({
						message: "Error fetching projects",
					});
					return;
				}
				const formattedProjects = results.map((project) => ({
					id: project.id,
					naziv_projekta: project.naziv_projekta,
					opis_projekta: project.opis_projekta,
					obavljeni_poslovi: project.obavljeni_poslovi,
					datum_pocetka: project.datum_pocetka,
					datum_zavrsetka: project.datum_zavrsetka,
				}));
				res.render("projects/assigned-projects", {
					title: "Assigned Projects",
					projects: formattedProjects,
				});
			}
		);
	} else {
		res.redirect("/");
	}
});

router.get("/:id", (req, res) => {
	const projectId = req.params.id;
	console.log(projectId);
	connection.query(
		"SELECT * FROM projects WHERE id = ?",
		projectId,
		(err, results) => {
			if (err) {
				console.error("Error fetching project:", err);
				res.status(500).render("error", {
					message: "Error fetching project",
				});
				return;
			}
			if (results.length === 0) {
				console.log(results);
				res.status(404).render("error", {
					message: "Project not found",
				});
				return;
			}
			const formattedProjects = results.map((project) => ({
				id: project.id,
				naziv_projekta: project.naziv_projekta,
				opis_projekta: project.opis_projekta,
				obavljeni_poslovi: project.obavljeni_poslovi,
				datum_pocetka: project.datum_pocetka,
				datum_zavrsetka: project.datum_zavrsetka,
			}));
			res.render("projects/view-project", {
				project: formattedProjects[0],
			});
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
		"INSERT INTO project_user (project_id, user_id) VALUES (?, ?)",
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

router.post("/:projectId/leave", async (req, res) => {
	const projectId = req.params.projectId;
	const userId = req.session.user.id;
	console.log(userId);
	connection.query(
		"DELETE FROM project_user where project_user.project_id = ? and project_user.user_id = ?",
		[projectId, userId],
		(err, result) => {
			if (err) {
				console.error("Error deleting member  from project:", err);
				res.status(500).json({
					message: "Error deleting member from project",
				});
				return;
			}
			res.json({ message: "Member deleted from project successfully" });
		}
	);
});

module.exports = router;
