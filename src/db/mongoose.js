const mongoose = require("mongoose");

const connectionURL = process.env.MONGO_DB_URL;

mongoose.connect(connectionURL + "/task-manager-api", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});
