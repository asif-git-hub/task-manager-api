const app = require("./app");
const port = process.env.PORT;

// Port listener
app.listen(port, () => {
	console.log("Server is running on port", port);
});
