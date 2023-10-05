const mongoose = require("mongoose");

const courcesShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter product Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter product Description"],
  },
  price: {
    type: String,
    // required: [true, "Please Enter product Price"],
   
  },
  status:{
    type: String,
    default: "Pending"

  },
  email: {
    type: String,
    required: [true, "Please Enter product Description"],
  },

  courseTitle: {
    type: String,
    required: [true, "Please Enter Product Category"],
  },
  images: [
    {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
  ],
  category: {
    type: String,
    // required: [true, "Please Enter Product Category"],
  },
  about: {
    type: String,
    required: [true, "Please Enter about"],
  },
  goal: {
    type: String,
    // required: [true, "Please Enter about"],
  },
  mission: {
    type: String,
    // required: [true, "Please Enter about"],
  },
  Stock: {
    type: Number,
    required: [true, "Please Enter product Stock"],
    maxLength: [4, "Stock cannot exceed 4 characters"],
    default: 1,
  },
  lat: {
    type: Number,
    // required: [false, "Please Enter course location"],
  },
  log: {
    type: Number,
    // required: [false, "Please Enter course location"],
  },

  boxOneImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  boxOneTitle: {
    type: String,
  },
  boxTwoImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  boxTwoTitle: {
    type: String,
  },
  boxThreeImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  boxThreeTitle: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const coursesModal = new mongoose.model("Courses", courcesShema);

module.exports = coursesModal;
