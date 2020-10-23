const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");

// Fetch all tasks
router.get("/tasks", auth, async (req, res) => {
	const match = {};
	if (req.query.completed) {
		match.completed = req.query.completed === "true";
	}
	const sort = {};
	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(":");
		sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
	}

	try {
		await req.user
			.populate({
				path: "tasks",
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort,
				},
			})
			.execPopulate();
		res.send(req.user.tasks);
	} catch (e) {
		console.log(e.stack);
		res.status(500).send("Unable to conncet to backend");
	}
});

// Insert new Task
router.post("/tasks", auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id,
	});
	try {
		await task.save();
		console.log(task);
		res.status(201).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

// Fetch single task
router.get("/tasks/:id", auth, async (req, res) => {
	const _id = req.params.id;

	try {
		const task_owner = req.user._id;
		const task = await Task.findOne({
			_id,
			owner: task_owner,
		});
		if (!task) {
			return res.status(404).send();
		}
		res.send(task);
	} catch (e) {
		console.log(e.stack);
		res.status(500).send();
	}
});

// Update single task
router.patch("/tasks/:id", auth, async (req, res) => {
	const _id = req.params.id;

	const allowedUpdates = ["description", "completed"];
	const updates = Object.keys(req.body);
	const isValid = updates.every((update) => {
		return allowedUpdates.includes(update);
	});

	try {
		const task = await Task.findOne({
			_id,
			owner: req.user._id,
		});
		if (!task) {
			return res.status(404).send();
		}

		updates.forEach((update) => {
			task[update] = req.body[update];
		});
		await task.save();

		res.send(task);
	} catch (e) {
		res.status(400).send();
	}
});

// Delete Task
router.delete("/tasks/:id", auth, async (req, res) => {
	try {
		const task_owner = req.user._id;
		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			owner: task_owner,
		});
		if (!task) {
			return res.status(404).send();
		}

		res.send(task);
	} catch (e) {
		res.status(500).send();
	}
});

module.exports = router;
