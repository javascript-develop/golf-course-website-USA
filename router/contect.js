const express = require("express");
const { createContect, getAllContectList, getContectDetels, deleteContect, } = require("../controler/contectControler");


const router = express.Router();

router.post("/contect" , createContect)
router.get("/contect" , getAllContectList)
router.get("/contect/:id" , getContectDetels)
router.delete("/contect/:id" , deleteContect)

module.exports = router