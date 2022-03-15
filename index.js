const express = require("express");
const userRouter = require("./router/userRouter");
const mongoose = require("mongoose");
const cors = require("cors");

const { roiDistribution } = require("./controller/userController");
// const http = require("http");
// const { Server } = require("socket.io");
// const {
//   roiIncomeSockets,
// } = require("./controller/userController");
require("dotenv").config();

mongoose
  .connect(process.env.URL, function () {
    console.log("Database connected!");
  })
  .catch(() => {
    console.log("Error occured in database connectivity!");
  });

const app = express();
// const httpServer = http.createServer(app);
// const io = new Server(httpServer);

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static("public"));
app.use("/user", userRouter);
app.get("/", function (res, res) {
  res.json({
    status: "1",
    msg: "running",
  });
});

// io.on("connection", (socket) => {
//   // send a message to the client
//   const userModel = require("../models/userSchema");
  // const freezeModel = require("./models/freezeSchema");
  
 
    // console.log(freez.freezeAmt * setting.roiPercentage);
    // const amount = (freez.freezeAmt * setting.roiPercentage) / 100;
    // console.log(amount);
    // const walletAddr = freez.walletAddr
    // socket.on("recieveWalletAddrSocket", (walletAddr) => {
    //   console.log("Wallet Addr :: ", walletAddr);
      // setInterval(async() => {
      //   const freez = await freezeModel.find()
      //   freez.map(async(d) => {
      //       await roiIncomeSockets(d.walletAddr)
      //   });
       
      // }, 100);
    // });

// });

// httpServer.listen(7000, () =>
//   console.log("Socker Server is Started on PORT: ", 7000)
// );


// roiDistribution()

app.listen(process.env.PORT, function () {
  console.log(`Server started : http://localhost:${process.env.PORT}`);
});
