require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const gmailSender = process.env.GMAIL_SENDER;
const gmailPass = process.env.GMAIL_PASSWORD;
// const accountSid = "AC7fd44883b369ff885e7fc83454485641";
// const authToken = "df0e00c808c436a9859d65bb836f80b3";
// const twilioNumber = "+16515058524";
// const gmailSender = "the.listner01@gmail.com";
// const gmailPass = "ykwnqvdskicoufzb";

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
		let receiver = await client.calls.create({
			twiml: "<Response><Say>Water Tank is about to overflow, be quick and turn off the electric motor!</Say></Response>",
			to: req.params.number,
			from: twilioNumber,
		});
		console.log(receiver);
		res.send(receiver);
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
		let receiver = await client.messages.create({
			body: "Water Tank is about to overflow, be quick and turn off the electric motor!",
			to: req.params.number,
			from: twilioNumber,
		});
		console.log(receiver);
		res.send(receiver);
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

		let receiver = await transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				res.status(500).send({
					err: "Something Went Wrong. Try again!",
					msg: err,
				});
			} else {
				console.log(info.response);
				res.send(info.response);
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
