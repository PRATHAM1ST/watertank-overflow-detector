require('dotenv').config({ path: `./.env.${process.env.ENVIRONMENT}` });
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

app.get("/", (req, res)=>{
	res.send("Welcome to Water-Tank water level detector!!")
})

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
		res.statusCode(500).send({ err: "Something Went Wrong. Try again!" });
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
		res.statusCode(500).send({ err: "Something Went Wrong. Try again!" });
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

		let receiver = await transporter
			.sendMail(mailOptions, (err, info) => {
				if (err) {
					res.statusCode(500).send({
						err: "Something Went Wrong. Try again!",
						msg: err,
					});
				}
                else{
                    console.log(info.response);
                    res.send(info.response);
                }
			})

	} catch (e) {
		res.statusCode(500).send({ err: "Something Went Wrong. Try again!" });
	}
});

//--------------------- listen ------------------------------------

app.listen(PORT, () => {
	console.log("Server Running at port: " + PORT);
});
