// CRUD Operations

// const mongoDB = require("mongodb");
// const MongoClient = mongoDB.MongoClient;
// const ObjectID = mongoDB.ObjectID;

const { MongoClient, ObjectID } = require("mongodb");
const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(
	connectionURL,
	{ useNewUrlParser: true },
	(error, client) => {
		if (error) {
			return console.log("Unable to connect to database");
		}
		console.log("Connection established");

		const db = client.db(databaseName);

		// db.collection("tasks")
		// 	.updateMany(
		// 		{
		// 			completed: false,
		// 		},
		// 		{
		// 			$set: {
		// 				completed: true,
		// 			},
		// 		}
		// 	)
		// 	.then((res) => {
		// 		console.log("Updated", res);
		// 	})
		// 	.catch((err) => {
		// 		console.log("Failed to update", err);
		// 	});

		// db.collection("users")
		// 	.deleteMany({
		// 		age: 23,
		// 	})
		// 	.then((res) => {
		// 		console.log("Done", res);
		// 	})
		// 	.catch((err) => {
		// 		console.log("Error");
		// 	});

		db.collection("tasks")
			.deleteOne({
				description: "Cook",
			})
			.then((res) => {
				console.log("Deleted", res);
			})
			.catch((err) => {
				console.log("Not able to delete");
			});
	}
);
