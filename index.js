require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const gmailSender = process.env.GMAIL_SENDER;
const gmailPass = process.env.GMAIL_PASSWORD;

const client = require("twilio")(accountSid, authToken);
const express = require("express");
var nodemailer = require("nodemailer");

const app = express();
const PORT = 5000;

//--------------------- welcome ------------------------------------

app.get("/", (req, res) => {
	res.send("Welcome to Water-Tank water level detector!!");
});

//--------------------- call ------------------------------------

app.get("/call/:number", async (req, res) => {
	try {
		await client.calls.create({
			twiml: "<Response><Say>Water Tank is about to overflow, be quick and turn off the electric motor!</Say></Response>",
			to: req.params.number,
			from: twilioNumber,
		});
		res.send({
			msg: "Call Sent successfully",
		});
	} catch (e) {
		res.status(500).send({
			err: "Something went wrong. Please try again.",
			msg: e,
		});
	}
});

//--------------------- sms ------------------------------------

app.get("/sms/:number", async (req, res) => {
	try {
		await client.messages.create({
			body: "Water Tank is about to overflow, be quick and turn off the electric motor!",
			to: req.params.number,
			from: twilioNumber,
		});
		res.send({
			msg: "SMS Sent successfully",
		});
	} catch (e) {
		res.status(500).send({
			err: "Something went wrong. Please try again.",
			msg: e,
		});
	}
});

//--------------------- mail ------------------------------------

var transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: gmailSender,
		pass: gmailPass,
	},
});

app.get("/mail/:receiverMail", async (req, res) => {
	try {
		const mailOptions = {
			from: gmailSender,
			to: req.params.receiverMail,
			subject: "TURN OFF ELECTRIC MOTOR",
			text: "Water Tank is about to overflow, be quick and turn off the electric motor!",
		};
		
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				res.status(500).send({
					err: "Something Went Wrong. Try again!",
					msg: err,
				});
			} else {
				res.send({
					msg: "Mail Sent successfully",
				});
			}
		});
	} catch (e) {
		res.status(500).send({
			err: "Something went wrong. Please try again.",
		});
	}
});

//--------------------- listen ------------------------------------

app.listen(PORT, () => {
	console.log("Server Running at port: " + PORT);
});
