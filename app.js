const express =require("express");
const app = express();
const cors = require("cors");
const sgMail = require('@sendgrid/mail');
const bodyParser = require('body-parser');

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cors());
// const cookieParser = require('cookie-parser')....
const fileUpload = require("express-fileupload");
// app.use(cookieParser())
app.use(express.json());

// Use body-parser middleware to parse request bodies
app.use(bodyParser.json());

app.use(fileUpload());
app.use(express.static("public"));

// all router
const userRouter = require("./router/user");
const courseRouter = require("./router/courses");
const orderRouter = require("./router/order");
const errorHandeler = require("./utilities/errorHendeler");
const contectHandeler = require("./router/contect");
const subscribeModal = require("./modal/subscribeModal");
app.use("/api/v1/user", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/contect", contectHandeler);
// stripe 
const stripe = require('stripe')('sk_test_51M8nImIzNDPNWkV5o9evL2xavXquzW1SeEWTrEQJZMQHsBh7d8IFMfkBzHvZ2q8gcJXgOP4Eu76v5fyqnB3ady3H00MHKhAFbO');
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

app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;
  console.log(email)
  // Send email to user using SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const userMsg = {
    to: email,
    from: "rubelrana019914@gmail.com",
    subject: "Thanks for subscribing!",
    text:"Hi, thanks for subscribing!",
    html: `<p>"Hi, thanks for subscribing!</p>`
  };
  try {
    await sgMail.send(userMsg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
    return;
  }

  // Send email to admin using SendGrid
  const adminMsg = {
    to: "rubelrana019914@gmail.com",
    from: "rubelrana019914@gmail.com",
    subject: "New subscriber",
    text: `${ email } has new subscribed to the mailing list.`,
    html: `<p>${ email } has new subscribed to the mailing list.</p>`
  };
try {
  await sgMail.send(adminMsg);
} catch (error) {
  console.error(error);
  res.status(500).json({ message: "Failed to send email" });
  return;
}
const subscriber = new subscribeModal({
  email,
});
try {
  await subscriber.save();
} catch (error) {
  console.error(error);
  res.status(500).json({ message: "Failed to save subscriber data" });
  return;
}
res.status(200).json({ message: "Success" });
});

app.use("/", (req, res) => {
  res.send("hellw world");
});

app.use(errorHandeler);

module.exports = app;
