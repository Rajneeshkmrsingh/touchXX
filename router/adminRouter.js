const express = require("express");
const { allFreezData, getAllUser } = require("../controller/adminController");
const router = express.Router();

// Api Naming Convention after every two following alphabet x,y,z,a,b,c will be add respectively 
router.use(express.json());

router.post("/allFreezData", allFreezData);
router.post("/getAllUser", getAllUser);


module.exports = router;