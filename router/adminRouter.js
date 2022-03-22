const express = require("express");
const { allFreezData, getAllUser, signup, signin, addWallet, adminWalletConfig, getAdminWallet } = require("../controller/adminController");
const router = express.Router();

// Api Naming Convention after every two following alphabet x,y,z,a,b,c will be add respectively 
router.use(express.json());


router.post("/signup", signup);
router.post("/signin", signin);
router.post("/addWallet", addWallet);
router.post("/adminWalletConfig", adminWalletConfig);
router.post("/getAdminWallet", getAdminWallet);



router.post("/allFreezData", allFreezData);
router.post("/getAllUser", getAllUser);


module.exports = router;