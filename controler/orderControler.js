const OrderDB = require("../modal/orderModal");
const Payment = require("../modal/paymentModel");
const CourseDB = require("../modal/coursesModal");
const nodemailer = require('nodemailer');
const User = require("../modal/userModal");
const stripe = require("stripe")(
  "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"
);
// exports.newOrder = async (req, res, next) => {
//   try {
 
//     const { shippingInfo, orderItems } = req.body;
//     console.log(req.body)
//     const { quantity , id } = orderItems;
//     const { name, email } = shippingInfo;

//     const order = await OrderDB.create({
//       productId: id,
//       name,
//       email,
//       limit: quantity,
//     });
//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
exports.newOrder = async (req, res, next) => {
  try {
    const { shippingInfo, orderItems } = req.body;
    const { quantity, id } = orderItems;
    const { name, email } = shippingInfo;

    let productId;
    if (!id) {
      // Generate a random product ID
      productId = generateRandomProductId();
    } else {
      productId = id;
    }

    let limit;
    if (!quantity) {
      // Generate a random limit
      limit = generateRandomLimit();
    } else {
      limit = quantity;
    }
    if (!ObjectId.isValid(productId)) {
      throw new Error('Invalid productId');
    }
    const order = await OrderDB.create({
      productId: ObjectId(productId),
      name,
      email,
      limit,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    // Handle error response
  }
};

function generateRandomProductId() {
  return '63d8f26b99966bb3c8cd1147'; // Replace with your desired product ID
}

function generateRandomLimit() {
  return Math.floor(Math.random() * 10) + 1; // Generate a random limit between 1 and 10
}

// nodemailer email system
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use the Gmail SMTP service (or you can use other SMTP services)
  auth: {
    user:"michigansbestgolfdeals@gmail.com", // Your Gmail email address
    pass: "bdgjooyjhwevpgfk", // Your Gmail password or App Password if you're using 2-factor authentication
  },
});
// payment router
exports.paymentHendler = async (req, res, next) => {
  try {
    const {
        orderItems,
        shippingInfo,
        paidPrice,
        emails, // Assuming you use this to identify the user to update as "PAID"
    } = req.body;

    const { id } = orderItems;
    const { name, email, address, country } = shippingInfo;

    let productId;

    if (!id) {
        // Generate a random product ID
        productId = generateRandomProductId(); // Replace this with your actual logic to generate product IDs
    } else {
        productId = id;
    }

    console.log(emails);

    // Create a payment record
    const order = await Payment.create({
        productId,
        name,
        email,
        address,
        country,
        paidPrice,
    });

    // Update user status to "PAID"
    const makeAdmin = await User.updateOne(
        { _id: emails },
        { $set: { status: "PAID" } }
    );

    console.log(req.body);

    if (makeAdmin.modifiedCount > 0) {
        // Send a payment confirmation email
        const mailOptions = {
          from: 'michigansbestgolfdeals@gmail.com',
          to: email,
          subject: 'Payment Confirmation',
          text: `Dear ${name},\n\nThank you for your payment of $${paidPrice}. Your order has been processed successfully.
      
      We are delighted to welcome you to MGBD (Michigan Golf Discount). By joining us, you are not only gaining 
      access to great discounts and exclusive offers but also contributing to our mission of supporting local
       veteran organizations and promoting junior golf throughout the state of Michigan.
      
      Here's what you can look forward to as a member:
      - Access to exclusive discounts and promotions from our partner golf courses.
      - Regular notifications about new discounts and exciting golf events.
      - The opportunity to enjoy the game you love while giving back to our community.
      
      Your support means the world to us, and we look forward to providing you with an exceptional golfing experience.
      
      Thank you once again for choosing MGBD, and we wish you many enjoyable rounds on the course!
      
      Sincerely,
      Michigansbestgolfdeals`
      };      

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({
            success: true,
            order,
        });
    } else {
        res.status(400).json({
            success: false,
            order,
        });
    }
} catch (error) {
    console.error(error);
    res.status(500).json({
        success: false,
        error: "An error occurred during payment processing.",
    });
}
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const order = await OrderDB.find({}).populate("user", "name email");
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getSingleOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const order = await OrderDB.findById(id).populate("user", "name email");
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order Not found!",
      });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.orderDelete = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const order = await Payment.findById(req.params.id);
    console.log(order);
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order Not found!",
      });
    }

    order.remove();
    res.status(200).json({
      success: true,
      message: "Order Delete Successfull",
    });
  } catch (error) {
    console.log(error);
  }
};
exports.orderDeleteCourse = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const order = await OrderDB.findById(req.params.id);
    console.log(order);
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order Not found!",
      });
    }

    order.remove();
    res.status(200).json({
      success: true,
      message: "Order Delete Successfull",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.myCourses = async (req, res, next) => {
  try {
    const email = req.params.email;

    const order = await OrderDB.find({ email: email }).populate("productId");
    console.log(order);
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order Not found!",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.discountPromoCode = async (req, res, next) => {
  try {
    const price = parseInt(req.query.totalCost);
    const promoCode = parseInt(req.query.code);
    console.log(req.query.code);
    const screctCode = ["freec"];
    const codeMatch = screctCode.includes(req.query.code);
    if (codeMatch) {
      const discountPrice = parseInt((price / 100) * 99);
      const totalPrice = price - discountPrice;
      res.status(200).json({
        success: true,
        discountPrice,
        totalPrice,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Sorry We dont discount",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.orderUpdate = async (req, res, next) => {
  try {
    const order = await OrderDB.findById(req.params.id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order Not found!",
      });
    }

    if (order.orderStatus === "Delivered") {
      res.status(400).json({
        success: false,
        message: "You Have All Ready Delivered This Order.",
      });
    }

    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
      });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
  }
};

async function updateStock(id, quantity) {
  try {
    const product = await CourseDB.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
  } catch (error) {}
}

exports.paymentGetWay = async (req, res, next) => {
  try {
    const service = req.body;
    const price = service.price;
    const amount = price * 100;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecrets: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.allSellesOrderList = async (req, res, next) => {
  const salles = await OrderDB.find({ productId: req.params.id });
  console.log(salles);
  res.send({ success: true, salles });
};

exports.sellersLimitDeccress = async (req, res, next) => {
  const sellersLimmit = await OrderDB.findById(req.params.id);
  console.log(sellersLimmit);
  if (sellersLimmit.limit > 0) {
    sellersLimmit.limit = sellersLimmit.limit - 1;
    sellersLimmit.save();
    res.send({ success: true, message: "Limit Reduce Succssfull" });
  } else {
    res.send({ success: false, message: "All Limit Allready Reduce" });
  }
  console.log(sellersLimmit);
};

exports.myOrder = async (req, res, next) => {
  try {
    const email = req.params.email;
    const order = await Payment.findOne({ email: email });
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order Not found!",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.allPayments = async (req, res, next) => {
  try {
    const order = await Payment.find({});
    res.status(200).json({
      success: true,
      order,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.allPaymentOrderList = async (req, res, next) => {
  const salles = await Payment.find({ productId: req.params.id });
  console.log(salles);
  res.send({ success: true, salles });
};
