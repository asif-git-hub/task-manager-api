const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const User = require("../models/user");
const multer = require("multer");
const sharp = require("sharp");
const {
	sendWelcomeEmail,
	sendCancellationEmail,
} = require("../emails/account");

const upload = multer({
	//dest: "avatar",
	limit: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
			return cb(
				new Error("Please upload an image with png, jpeg or jpg extenstion")
			);
		}
		cb(undefined, true);
	},
});

// Insert new user
router.post("/users", async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		sendWelcomeEmail(user.email, user.name);
		const token = await user.generateAuthToken();
		res.status(201).send({ user, token });
	} catch (e) {
		res.status(400).send(e);
	}
});

// Get all users
router.get("/users/me", auth, async (req, res) => {
	res.send(req.user);
});

// Get a single user
router.get("/users/:id", async (req, res) => {
	const _id = req.params.id;

	try {
		const user = await User.findById(_id);
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (e) {
		res.status(500).send();
	}
});

// Update user by id
router.patch("/users/me", auth, async (req, res) => {
	const _id = req.params.id;

	const allowerUpdates = ["name", "email", "password", "age"];
	const updates = Object.keys(req.body);
	const isValid = updates.every((update) => {
		return allowerUpdates.includes(update);
	});

	if (!isValid) {
		return res.status(400).send({ error: "Invalid Update" });
	}

	try {
		updates.forEach((update) => {
			req.user[update] = req.body[update];
		});
		await req.user.save();
		res.send(req.user);
	} catch (e) {
		res.status(400).send();
	}
});

// Delete user
router.delete("/users/me", auth, async (req, res) => {
	try {
		await req.user.remove();
		sendCancellationEmail(req.user.email, req.user.name);
		res.send(req.user);
	} catch (e) {
		console.error(e);
		res.status(500).send();
	}
});

// Login
router.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		);
		const token = await user.generateAuthToken();
		res.send({ user, token });
	} catch (e) {
		console.error(e);
		res.status(400).send();
	}
});

// Upload new profile picture
router.post(
	"/users/me/avatar",
	auth,
	upload.single("avatar"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({
				width: 250,
				height: 250,
			})
			.png()
			.toBuffer();

		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// Delete profile picture
router.delete(
	"/users/me/avatar",
	auth,
	async (req, res) => {
		req.user.avatar = undefined;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

// Get avatar
router.get("/users/:id/avatar", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user || !user.avatar) {
			throw new Error();
		}

		res.set("Content-Type", "image/png");
		res.send(user.avatar);
	} catch (e) {
		res.status(404).send();
	}
});

// Logout
router.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

// Logout all
router.post("/users/logoutall", auth, async (req, res) => {
	try {
		req.user.tokens = [];

		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

module.exports = router;