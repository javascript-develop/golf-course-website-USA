const express = require("express");
const {
  commentpost,
  comments,
  pendingcomments,
  approveComment,
  deletecomment,

} = require("../controler/commentControler");

const router = express.Router();

router.post("/comment", commentpost);
router.get("/comment/comments", comments);
router.get("/comment/pendingcomments", pendingcomments);
router.put("/comment/approveComment/:id", approveComment);
router.delete("/comment/:id", deletecomment);

module.exports = router;