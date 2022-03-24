const express = require("express");
const { validateEmail } = require("../middleware/validation");
const user = express.Router();
const { insertUserApi, freezeApi, unStake, test, checkUserExist, roiIncomeSocket, insertAdminApi, getFreez, getTeam, referalHarvest } = require('../controller/userController')


user.use(express.json());

// Api Naming Convention after every two following alphabet x,y,z,a,b,c will be add respectively 

user.post("/test", validateEmail, test)

user.post("/saxveyuszer", insertUserApi)

user.post("/getTeam", getTeam)

user.post("/saxveyadmin", insertAdminApi)

user.post("/chxecykuzsear", checkUserExist)

user.post("/frxeeyzezamat", freezeApi)

user.post("/getFreez", getFreez)

user.post("/roxiIynczomaeSboccket", roiIncomeSocket)

user.post("/unxStyakze", unStake)

user.post("/referalHarvest", referalHarvest)



module.exports = user;










// https://k6.io/docs/javascript-api/k6-ws/socket/socket-setinterval-callback-interval/