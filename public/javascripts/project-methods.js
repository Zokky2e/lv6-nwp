async function leaveProject(projectId) {
	console.log(projectId);
	try {
		const response = await fetch(`/projects/${projectId}/leave/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});

		if (!response.ok) {
			throw new Error("Failed to leave project");
		}

		window.location.href = "/projects/assigned";
	} catch (error) {
		console.error("Error leaving project:", error);
		window.location.href = "/error";
	}
}

async function assignUser(projectId) {
	try {
		var userId = document.querySelector(
			`select[name='assign-${projectId}']`
		).value;
		const response = await fetch(
			`/projects/${projectId}/addMember/${userId}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to assign user to project");
		}

		window.location.href = "/projects/my";
	} catch (error) {
		console.error("Error assigning user to project:", error);
		window.location.href = "/error";
	}
}

async function viewProject(projectId) {
	try {
		const response = await fetch(`/projects/${projectId}`);

		if (!response.ok) {
			throw new Error("Failed to load project");
		}

		window.location.href = `/projects/${projectId}`;
	} catch (error) {
		console.error("Error loading project:", error);
		window.location.href = "/error";
	}
}
