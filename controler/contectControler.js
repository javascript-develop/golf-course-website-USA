const ContectDB = require("../modal/contectModal");

const nodemailer = require("nodemailer");

exports.createContect = async (req, res, next) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    await ContectDB.create({
      name,
      phone,
      email,
      subject,
      message,
    });

    // send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user:"michigansbestgolfdeals@gmail.com",
        pass: "bdgjooyjhwevpgfk",
      },
    });

    const mailOptions = {
      from: "your-gmail-username",
      to: "michigansbestgolfdeals@gmail.com",
      subject: "New message from website",
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Message Send Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};


exports.getAllContectList = async (req, res, next) => {
  try {
    const contect = await ContectDB.find({});
    res.send({ success: true, contect });
  } catch (e) {
    console.log(e);
  }
};

exports.deleteContect = async (req, res, next) => {
  const id = req.params.id;
  let contect = await ContectDB.findById(id);
  if (!contect) {
    res.status(500).json({
      success: false,
      message: "contect Not found",
    });
  }
  await contect.remove();
  res.status(200).json({
    success: true,
    message: "Message Delete Successfull",
  });
};

exports.getContectDetels = async (req, res, next) => {
  const id = req.params.id;
  const contect = await ContectDB.findById(id);
  res.json({
    success: true,
    contect,
  });
};
