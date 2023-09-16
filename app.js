const express = require("express");
const app = express();
const cors = require("cors");
// const mongoose = require('mongoose');
// require('dotenv').config();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cors());
// const cookieParser = require('cookie-parser')....
const fileUpload = require("express-fileupload");
// middelwar
// app.use(cookieParser())
app.use(express.json());

app.use(fileUpload());
app.use(express.static("public"));

// all router
const userRouter = require("./router/user");
const courseRouter = require("./router/courses");
const orderRouter = require("./router/order");
const errorHandeler = require("./utilities/errorHendeler");
const contectHandeler = require("./router/contect");
const subscribeModal = require("./modal/subscribeModal");
const { userLogin } = require("./controler/userControler");
app.use("/api/v1/user", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/contect", contectHandeler);

// stripe gateway 
const stripe = require('stripe')('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');
app.post('/pay', async (req, res) => {
  const { amount, paymentMethodId } = req.body;
  console.log(amount, "amount ok");

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convert amount to cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
    });
    res.status(200).json({ message: "Payment successful!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Payment failed." });
  }
});

app.get("/cancel", (req, res) => res.send("Cancelled"));



// subs server code

const nodemailer = require("nodemailer");

// Create a transporter using Gmail SMTP credentials
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user:"michigansbestgolfdeals@gmail.com",
    pass: "bdgjooyjhwevpgfk",
  },
});

app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  // Create the email message
  const userMsg = {
    from: "michigansbestgolfdeals@gmail.com",
    to: "michigansbestgolfdeals@gmail.com",
    subject: "New subscriber",
    text: `${ email } has new subscribed to the mailing list.`,
    html: `<p>${ email } has new subscribed to the mailing list.</p>`
  };

  try {
    // Send the email
    await transporter.sendMail(userMsg);

    // Save subscriber data to your database (if needed)
    const subscriber = new subscribeModal({
      email,
    });
    await subscriber.save();

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
});




app.use("/", (req, res) => {
  res.send("hellw world");
});

app.use(errorHandeler);

module.exports = app;
