const sgMail = require("@sendgrid/mail");

const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (!sendGridApiKey) {
	throw new Error("SendGrid Api Key undefined!");
}

sgMail.setApiKey(sendGridApiKey);

const sendWelcomeEmail = async (email, name) => {
	await sgMail.send({
		to: email,
		from: "asifalam0308@gmail.com",
		subject: `Welcome ${name}`,
		text: `Hi ${name}, welcome to the task manager app. Let us know how you find the app.`,
	});
};

const sendCancellationEmail = async (email, name) => {
	await sgMail.send({
		to: email,
		from: "asifalam0308@gmail.com",
		subject: "We are sorry to see you go",
		text: `Hi ${name}, we are sorry to see you go. Please let us know if we could have made your experience better.`,
	});
};

module.exports = {
	sendWelcomeEmail,
	sendCancellationEmail,
};
