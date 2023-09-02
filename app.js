const express = require("express");
const app = express();
const cors = require("cors");
const sgMail = require('@sendgrid/mail');
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


// chatbot code 

const bodyParser = require('body-parser');
const axios = require('axios');


app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN'; // Replace with your Facebook page access token
const ADMIN_FACEBOOK_ID = 'ADMIN_FACEBOOK_USER_ID'; // Replace with your admin Facebook user ID

const messageQueue = []; // In-memory queue to store incoming messages

app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Endpoint to receive incoming messages from Facebook Messenger
app.post('/messenger-webhook', (req, res) => {
  const messagingEvents = req.body.entry[0].messaging;

  // Handle each messaging event
  messagingEvents.forEach((event) => {
    if (event.message && event.message.text && event.sender && event.sender.id) {
      const senderId = event.sender.id; // Facebook Messenger ID of the user
      const messageText = event.message.text; // Received message text

      // Enqueue the incoming message along with the sender's Facebook Messenger ID
      messageQueue.push({ senderId, messageText });
    }
  });

  res.sendStatus(200);
});

// Background process to process queued messages and deliver replies
setInterval(() => {
  while (messageQueue.length > 0) {
    const { senderId, messageText } = messageQueue.shift();

    // Process the incoming message and generate a response
    const responseText = `Received a message from user with ID ${senderId}: "${messageText}". This is an automated response.`;

    // If the sender's Facebook Messenger ID is the admin ID, no need to reply
    if (senderId !== ADMIN_FACEBOOK_ID) {
      // Reply to the user using Facebook Messenger
      sendMessengerResponse(senderId, responseText);
    }
  }
}, 5000); // Check the queue every 5 seconds (adjust this interval as needed)

app.listen(3001, () => {
  console.log('Server is listening on port 3001');
});

// Send a message to a Facebook user using Facebook Messenger
function sendMessengerResponse(recipientId, responseText) {
  const url = `https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  const messageData = {
    recipient: { id: recipientId },
    message: { text: responseText },
  };

  axios
    .post(url, messageData)
    .then((response) => {
      console.log('Messenger response sent:', response.data);
    })
    .catch((error) => {
      console.error('Error sending Messenger response:', error.message);
    });
}






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
