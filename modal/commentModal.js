const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  text: String,
  status: String,
});

const commentModel = mongoose.model("Comment", CommentSchema);

module.exports = commentModel;
