const CoursesDB = require("../modal/coursesModal");
const cloudinary = require("cloudinary");
const saveDiscountCodeToDb = require("../utilities/saveDiscountCodeToDb");
const Discount = require("../modal/Discount");

exports.createCourse = async (req, res, next) => {
  try {
    console.log(req.body)
    if (req.body.images !== "") {

      var myCloud = await cloudinary.v2.uploader.upload(req.body.images, {
        folder: "products",
        // width: 150,
        crop: "scale",
      });

    }
    if (req.body.boxOneImage !== "") {
      var CloudboxOneImage = await cloudinary.v2.uploader.upload(
        req.body.boxOneImage,
        {
          folder: "products",
          // width: 150,
          crop: "scale",
        }
      );
    }
    if (req.body.boxTwoImage !== "") {
      var CloudboxTwoImage = await cloudinary.v2.uploader.upload(
        req.body.boxTwoImage,
        {
          folder: "products",
          // width: 150,
          crop: "scale",
        }
      );
    }
    if (req.body.boxThreeImage !== "") {
      var CloudboxThreeImage = await cloudinary.v2.uploader.upload(
        req.body.boxThreeImage,
        {
          folder: "products",
          // width: 150,
          crop: "scale",
        }
      );
    }


    const {
      name,
      description,
      email,
      category,
      courseTitle,
      Stock,
      about,
      goal,
      price,
      mission,
      log,
      lat,
      boxOneTitle,
      boxTwoTitle,
      boxThreeTitle,
    } = req.body;

    const sendProudcts = await CoursesDB.create({
      name,
      description,
      email,
      category,
      price,
      courseTitle,
      Stock,
      about,
      goal,
      mission,
      log: req?.body?.log == "NaN" ? 0 : log,
      lat: req.body.lat == "NaN" ? 0 : lat,
      boxOneTitle,
      boxTwoTitle,
      boxThreeTitle,
      images: {
        public_id: myCloud?.public_id,
        url: myCloud?.secure_url,
      },
      boxOneImage: {
        public_id: CloudboxOneImage?.public_id,
        url: CloudboxOneImage?.secure_url,
      },
      boxTwoImage: {
        public_id: CloudboxTwoImage?.public_id,
        url: CloudboxTwoImage?.secure_url,
      },
      boxThreeImage: {
        public_id: CloudboxThreeImage?.public_id,
        url: CloudboxThreeImage?.secure_url,
      },
    });
    res.status(200).json({
      success: true,
      message: "Course Publish Successfull",
      product: sendProudcts,
    });
  } catch (e) {
    console.log(e);
    res.send({ success: false, message: e.message })

  }
};

// active course controler 
exports.activeCourse = async (req, res, next) => {
  try {

    const id = req.params.id;
    let course = await CoursesDB.findById(id);
    console.log(course)

    if (!course) {
      res.status(500).json({
        success: false,
        message: "Course Not found",
      });
    }

    course = await CoursesDB.findByIdAndUpdate(
      id, req.body,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }

    );

    console.log(course)



    res.status(200).json({
      success: true,
      course,
    });
  }
  catch (err) {
    console.log(err)
  }
}

exports.getAllCourse = async (req, res, next) => {
  try {
    const { category, kewword } = req.query;
    const query = {};

    if (category && category !== "All") {
      query.category = { $regex: category, $options: "i" };
    }

    if (kewword) {
      query.name = { $regex: kewword, $options: "i" };
    }

    const course = await CoursesDB.find(query);
    res.send({ success: true, course });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e.message });
  }
};

// old update controler route 
//  exports.updateCourser = async (req, res, next) => {
//   const id = req.params.id;
//   let course = await CoursesDB.findById(id);
//   if (!course) {
//     res.status(500).json({
//       success: false,
//       message: "Course Not found",
//     });
//   }

//   course = await CoursesDB.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });

//   res.status(200).json({
//     success: true,
//     course,
//   });
// };


// new update controler route 
exports.updateCourser = async (req, res, next) => {
  try {
    const {
      name,
      description,
      email,
      category,
      courseTitle,
      Stock,
      about,
      goal,
      price,
      mission,
      log,
      lat,
      images,
      boxOneTitle,
      boxTwoTitle,
      boxThreeTitle,
      boxOneImage,
      boxTwoImage,
      boxThreeImage
    } = req.body;

  console.log(req.body.lat == "NaN")
   
    const id = req.params.id;
    let course = await CoursesDB.findById(id);
  
    if (!course) {
      res.status(500).json({
        success: false,
        message: "Course Not found",
      });
    }

    course = await CoursesDB.findByIdAndUpdate(
      id,

      {
        name,
        description,
        email,
        category,
        courseTitle,
        Stock,
        about,
        goal,
        price,
        mission,
        log: req.body.log == "NaN" ? "" : log,
        lat:  req.body.lat == "NaN" ? "" : lat,
        images: {
          url: images
        },
        boxOneTitle,
        boxTwoTitle,
        boxThreeTitle,
        boxOneImage: {
          url: req.body.boxOneImage == "undefined" ? "": boxOneImage
        },
        boxTwoImage: {
          url: req.body.boxTwoImage == "undefined" ? "": boxTwoImage
        },
        boxThreeImage: {
          url: req.body.boxThreeImage == "undefined" ? "": boxThreeImage
        }
      }
  
      ,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }

    );



    res.status(200).json({
      success: true,
      course,
    });
  }
  catch (e) {
    console.log(e);
  }

};

exports.validatePromo = async (req, res, next) => {
  const { code, } = req.params;

  try {
    const discount = await Discount.findOne({ code });
    console.log("DISCOUT",discount)
    if (!discount) {
      throw new Error('Coupon not found');
    } if (discount.usageLimit === 0) {
      throw new Error('Coupon limit reached');
    }

    discount.usageLimit = discount.usageLimit - 1;
    await discount.save();

    if (new Date(discount.expiresAt) > Date.now())
      res.status(200).json({
        success: true,
        discount,
      });
  }
  catch (e) {

    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const id = req.params.id;
    let course = await CoursesDB.findById(id);
    console.log(course);
    if (!course) {
      res.status(500).send({
        success: false,
        message: "Course Not found",
      });
    }
    else {
      await course.remove();
      res.status(200).send({
        success: true,
        message: "Course Delete Successfull",
      });
    }
  }

  catch (e) {

  }
};

exports.generateDeleteCuponCode = async (req, res, next) => {
  try {
    const id = req.params.id;
    let discountcode = await Discount.findById(id);
    console.log(discountcode);
    if (!discountcode) {
      res.status(500).send({
        success: false,
        message: "Course Not found",
      });
    }
    else {
      await discountcode.remove();
      res.status(200).send({
        success: true,
        message: "Course Delete Successfull",
      });
    }
  }

  catch (e) {

  }
};

exports.getCourseDetels = async (req, res, next) => {
  const id = req.params.id;
  const course = await CoursesDB.findById(id);
  res.json({
    success: true,
    course,
  });
};

exports.myActiveCourses = async (req, res, next) => {
  const course = await CoursesDB.find({ email: req.params.email })
  console.log(course)
  res.send({ success: true, course })

}

exports.allPayments = async (req, res, next) => {
  try {
    const payments = await payments.find()
    console.log(payments)
    res.send({ success: true, payments })
  }
  catch (e) {
    console.log(e,"Payment");
  }

}

exports.getAllPromoCode = async (req, res, next) => {
  try {
    const promeCode = await Discount.find()
    console.log(promeCode)
    res.send({ success: true, promeCode })
  }
  catch (e) {
    console.log(e);
  }
}

exports.generateCuponCode = async (req, res, next) => {
  console.log(req.body)
  const { amount, code, expiresAt, usageLimit } = req.body;
  console.log(code)
  // generate discount code logic
  console.log(amount, expiresAt)
  // const discountCode = generateDiscountCode(amount);
  // save discount code to database
  // const { code } = discountCode
  const saveDiscountCode = { code, expiresAt, amount, usageLimit }
  console.log(saveDiscountCode)
  saveDiscountCodeToDb(saveDiscountCode);
  // res.json({ discountCode });

}
