const userModel = require("../models/userSchema");
const freezeModel = require("../models/freezeSchema");
const Setting = require("../models/settingSchema");
const { Server } = require("socket.io");
const { set } = require("express/lib/response");
const { transferTrx, freezAmountDeduct } = require("../utils/transferTRX");
const io = new Server(8081);

io.on("connection", (socket) => {
  // send a message to the client
  let a ;
  socket.on("recieveWalletAddrSocket", (walletAddr) => {
    a =setInterval(() => {
      console.log("Wallet Addr :: ", walletAddr);
      roiIncomeSockets(walletAddr).then((a) => {
        socket.emit("roiIncomeSocket", a);
      });
    }, 100000);
  });

  socket.on("disconnect",() => {
    socket.disconnect();
    clearInterval(a);
  })
});

async function test(req, res) {
  res.json({
    status: true,
    msg: "data inserted",
  });
}

//<----------------- FUNCTIONS ------------------->
// roiIncomeSockets("WalldedtAsdssddsdsra").then((a) => {
//     console.log("Fucn", a);
// });

function roiIncomeSockets(walletAddr) {
  if (walletAddr) {
    let date = new Date().getTime();
    return new Promise((resolve, reject) => {
      freezeModel
        .findOne({ walletAddr: walletAddr, freezeStatus: 1 })
        .then((freezeData) => {
          if (freezeData) {
            let perSecondRoi =(freezeData.freezeAmt * (1 / 100)) / (60 * 60 * 24);
            let refferalperSecondRoi =(freezeData.freezeAmt * (0.1 / 100)) / (60 * 60 * 24);
            if (date < freezeData.freezeEndDuration) {
              let diffTime = date / 1000 - freezeData.freezeStartDuration / 1000;
              let parentdiffTime = date / 1000 - freezeData.parentHarvst / 1000; // parrent
              let parentRemainTime = freezeData.freezeEndDuration / 1000 - date / 1000; // parent
              let diffRemainTime = freezeData.freezeEndDuration / 1000 - date / 1000;
              let totalRoi = perSecondRoi * diffTime;
              let totalRefcomision = refferalperSecondRoi * parentdiffTime; // parent
              let parentTotalRemaningRoi = refferalperSecondRoi * parentRemainTime; // parrent
              let totalRemainRoi = perSecondRoi * diffRemainTime;
              // console.log("Freeze111 :: ", perSecondRoi, totalRoi);

              resolve({
                status: 200,
                freezeAmt: freezeData.freezeAmt,
                objectId: freezeData._id,
                perSecondRoi: perSecondRoi,
                totalRemainRoi: totalRemainRoi,
                totalRefcomision: totalRefcomision,
                totalRoi: totalRoi,
                refferalperSecondRoi: refferalperSecondRoi,
                parentTotalRemaningRoi: parentTotalRemaningRoi,
              });
            } else {
              let diffTime = freezeData.freezeEndDuration / 1000 - freezeData.freezeStartDuration / 1000;
              let totalRoi = perSecondRoi * diffTime;
              let totalRefcomision = refferalperSecondRoi * diffTime;
              freezeModel.updateOne(
                { walletAddr: walletAddr },
                {
                  $set: {
                    roiAmount: totalRoi,
                    parentroiAmount: totalRefcomision,
                    freezeStatus: 2,
                  },
                }
              );
              resolve({
                status: 200,
                freezeAmt: Number(freezeData.freezeAmt),
                objectId: freezeData._id,
                perSecondRoi: perSecondRoi,
                totalRemainRoi: 0,
                totalRoi: totalRoi,
                totalRefcomision: totalRefcomision,
                refferalperSecondRoi: refferalperSecondRoi,
              });
            }
          } else {
            resolve({
              status: 400,
              msg: "No Data Found!",
            });
          }
        })
        .catch((error) => {
          console.log("Error in roiIncomeSockets Function!", error.message);
          reject(error);
        });
    });
  }
}

async function uniqueIdGenerator() {
  var uniqueId = Math.floor(1000000 + Math.random() * 9999999);
  return userModel
    .count({
      uniqueId: uniqueId,
    })
    .then((resp) => {
      if (resp == 0) {
        return uniqueId;
      } else {
        return uniqueIdGenerator();
      }
    })
    .catch((error) => {
      console.log("Error in uniqueIdGenerator Function!", error.message);
    });
}

async function getUserDetailsById(uniqueId) {
  let cond = {};
  if (uniqueId.toString().length == 7) {
    cond = { uniqueId: uniqueId };
  } else {
    cond = { walletAddr: uniqueId };
  }
  return userModel
    .findOne(cond)
    .then((resp) => {
      return {
        status: true,
        data: resp != null ? resp : "selfrererr",
      };
    })
    .catch((error) => {
      console.log("Error in getUserDetailsById Function!", error.message);
    });
}

//<----------------- API FOR FRONTEND ------------------->

async function checkUserExist(req, res) {
  try {
    const uniqueId = req.body.uniqueId;
    if (uniqueId != undefined) {
      getUserDetailsById(uniqueId).then((userDetail) => {
        console.log(userDetail);

        if (userDetail.status) {
          res.json({
            status: 200,
            data: userDetail.data,
          });
        } else {
          res.json({
            status: 400,
            msg: "Invalid Unique Id!",
          });
        }
      });
    } else {
      res.json({
        status: 400,
        msg: "Inputs are invalid!",
      });
    }
  } catch (error) {
    console.log("Error in checkUserExist Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function insertAdminApi(req, res) {
  const Admin = require("../models/admin");
  try {
    const { walletName, walletAddr, privateKey } = req.body;
    // const isarr = Array.isArray(mnemonicPhrase) ? mnemonicPhrase.length > 0 ? true : false: false;
    if (
      walletAddr &&
      walletName
      // isarr
    ) {
      uniqueIdGenerator()
        .then((uniqueId) => {
          Admin.count({
            uniqueId: uniqueId,
            walletAddr: walletAddr,
            walletName: walletName,
          })
            .then((resp) => {
              if (resp == 0) {
                Admin.create({
                  uniqueId: uniqueId,
                  walletAddr: walletAddr,
                  walletName: walletName,
                  privateKey: privateKey,
                  // mnemonicPhrase: mnemonicPhrase,
                })
                  .then(() => {
                    res.json({
                      status: 200,
                      msg: "Data Submitted successfully!",
                    });
                  })
                  .catch((error) => {
                    console.log("Error in insertUser Function!", error.message);
                    res.json({
                      status: 400,
                      msg: "Something went wrong!",
                    });
                  });
              } else {
                res.json({
                  status: 400,
                  msg: "Duplicate data are not allowed to insert!",
                });
              }
            })
            .catch((error) => {
              console.log("Error in insertUser Function!", error.message);
              res.json({
                status: 400,
                msg: "Something went wrong!",
              });
            });
        })
        .catch((error) => {
          console.log("Error in uniqueIdGenerator Function!", error.message);
          res.json({
            status: 400,
            msg: "Something went wrong!",
          });
        });
    } else {
      res.json({
        status: 400,
        msg: "Inputs are invalid!",
      });
    }
  } catch (error) {
    console.log("Error in insertUser Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function insertUserApi(req, res) {
  try {
    const { walletName, walletAddr, referrerAddr, privateKey, mnemonicPhrase } =
      req.body;
    const isarr = Array.isArray(mnemonicPhrase)
      ? mnemonicPhrase.length > 0
        ? true
        : false
      : false;
    if (
      (walletAddr && walletName && privateKey && mnemonicPhrase && isarr) ||
      referrerAddr
    ) {
      uniqueIdGenerator()
        .then((uniqueId) => {
          userModel
            .count({
              uniqueId: uniqueId,
              walletAddr: walletAddr,
              walletName: walletName,
              privateKey: privateKey,
            })
            .then((resp) => {
              if (resp == 0) {
                getUserDetailsById(referrerAddr).then((userDetail) => {
                  console.log(userDetail);
                  if (userDetail.status) {
                    userModel
                      .create({
                        uniqueId: uniqueId,
                        walletAddr: walletAddr,
                        walletName: walletName,
                        privateKey: privateKey,
                        referrerId: userDetail.data.referrerId
                          ? userDetail.data.referrerId
                          : "selfrererr",
                        referrerAddr: userDetail.data.walletAddr
                          ? userDetail.data.walletAddr
                          : "",
                        mnemonicPhrase: mnemonicPhrase,
                      })
                      .then(() => {
                        res.json({
                          status: 200,
                          msg: "Data Submitted successfully!",
                        });
                      })
                      .catch((error) => {
                        console.log(
                          "Error in insertUser Function!",
                          error.message
                        );
                        res.json({
                          status: 400,
                          msg: "Something went wrong!",
                        });
                      });
                  } else {
                    res.json({
                      status: 400,
                      msg: "Invalid Unique Id!",
                    });
                  }
                });
              } else {
                res.json({
                  status: 400,
                  msg: "Duplicate data are not allowed to insert!",
                });
              }
            })
            .catch((error) => {
              console.log("Error in insertUser Function!", error.message);
              res.json({
                status: 400,
                msg: "Something went wrong!",
              });
            });
        })
        .catch((error) => {
          console.log("Error in uniqueIdGenerator Function!", error.message);
          res.json({
            status: 400,
            msg: "Something went wrong!",
          });
        });
    } else {
      res.json({
        status: 400,
        msg: "Inputs are invalid!",
      });
    }
  } catch (error) {
    console.log("Error in insertUser Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function getTeam(req, res) {
  try {
    const { walletAddr } = req.body;
    freezeModel.find({ referrerAddr: walletAddr }).then((data) => {
      if (data && data.length > 0) {
        return res.status(200).json({ msg: "All record", team: data });
      } else {
        return res.status(200).json({ msg: "refferls not found", team: data });
      }
    });
    // userModel.aggregate([
    //   { "$match":  {referrerAddr: walletAddr} },
    //   {
    //       $lookup: {
    //           from: "user",
    //           localField: "referrerAddr",
    //           foreignField: "referrerAddr",
    //           as: "freeze"
    //       }
    //   },
    //   {
    //     $project: {
    //       referrerAddr: 1,
    //       "freeze.walletAddr": 1,
    //       "freeze.freezeAmt": 1,
    //       "freeze.freezeStartDuration": 1,
    //       "freeze.freezeEndDuration": 1,
    //       "freeze.freezeStatus": 1,

    //     }
    //   }
    // ])
  } catch (error) {
    console.log("error:: ", error);
    res.json({
      status: 400,
      msg: "Inputs are invalid!",
    });
  }
}

async function freezeApi(req, res) {
  const adminWallet = require("../models/adminWallet")
  try {
    const { freezeAmt, walletAddr } = req.body;
    if (freezeAmt != undefined && walletAddr != undefined) {
      userModel.findOne({ walletAddr: walletAddr }).then((resp) => {
          if (resp) {
            if (resp.status == 1) {
              userModel
                .updateOne(
                  { name: "Central Perk Cafe" },
                  { $set: { violations: 3 } }
                )
                .then(() => {
                  freezeModel
                    .create({
                      uniqueId: resp.uniqueId,
                      walletName: resp.walletName,
                      walletAddr: resp.walletAddr,
                      referrerId: resp.referrerId,
                      referrerAddr: resp.referrerAddr,
                      freezeAmt: Number(freezeAmt),
                      totalCountRoi: 7,
                      parentHarvst: new Date().getTime(),
                      userHarvst: new Date().getTime(),
                      freezeStartDuration: new Date().getTime(),
                      freezeEndDuration: new Date().getTime() + 604800000,
                    })
                    .then(async() => {
                      userDetail = {
                        walletAddr: resp.walletAddr,
                        privateKey: resp.privateKey
                      }
                      await  freezAmountDeduct(userDetail, freezeAmt)
                      return res.json({
                        status: 200,
                        msg: "Data Submitted successfully!",
                      });
                    })
                    .catch((error) => {
                      console.log(
                        "Error in freezeApi Function!",
                        error.message
                      );
                      return res.json({
                        status: 400,
                        msg: "Something went wrong!",
                      });
                    });
                })
                .catch((error) => {
                  console.log("Error in freezeApi Function!", error.message);
                  return res.json({
                    status: 400,
                    msg: "Something went wrong!",
                  });
                });
            } else {
              return res.json({
                status: 400,
                msg: "Wallet is already frozen!",
              });
            }
          } else {
            return res.json({
              status: 400,
              msg: "Invalid arguments passed!",
            });
          }
        })
        .catch((error) => {
          console.log("Error in freezeApi Function!", error.message);
          return res.json({
            status: 400,
            msg: "Something went wrong!",
          });
        });
    } else {
      console.log("Error in freezeApi Function!", error.message)
      return res.json({
        status: 400,
        msg: "Inputs are invalid!",
      });
    }
  } catch (error) {
    console.log("Error in freezeApi Function!", error.message);
    return res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function roiIncomeSocket(req, res) {
  try {
    const { walletAddr } = req.body;
    if (walletAddr) {
      let date = new Date().getTime();
      freezeModel
        .findOne({
          walletAddr: walletAddr,
          freezeStatus: 1,
          freezeStartDuration: { $lte: date },
          freezeEndDuration: { $gte: date },
        })
        .then((freezeData) => {
          // let diffTime = date / 1000 - freezeData.freezeStartDuration / 1000;
          // let diffRemainTime =
          //   freezeData.freezeEndDuration / 1000 - date / 1000;
          // let perSecondRoi =
          //   (freezeData.freezeAmt * (1 / 100)) / (60 * 60 * 24);
          // let totalRoi = perSecondRoi * diffTime;
          // let totalRemainRoi = perSecondRoi * diffRemainTime;
          // let refferalperSecondRoi =
          //   (freezeData.freezeAmt * (0.1 / 100)) / (60 * 60 * 24);
          // let totalReferralRoi = refferalperSecondRoi * diffTime;
          let perSecondRoi =
          (freezeData.freezeAmt * (1 / 100)) / (60 * 60 * 24);
        let refferalperSecondRoi =
          (freezeData.freezeAmt * (0.1 / 100)) / (60 * 60 * 24);
          let diffTime =
            date / 1000 - freezeData.freezeStartDuration / 1000;
          let parentdiffTime = date / 1000 - freezeData.parentHarvst / 1000; // parrent
          let parentRemainTime =
            freezeData.freezeEndDuration / 1000 - date / 1000; // parent
          let diffRemainTime =
            freezeData.freezeEndDuration / 1000 - date / 1000;
          let totalRoi = perSecondRoi * diffTime;
          let totalRefcomision = refferalperSecondRoi * parentdiffTime; // parent
          let parentTotalRemaningRoi = refferalperSecondRoi * parentRemainTime; // parrent
          let totalRemainRoi = perSecondRoi * diffRemainTime;
          // console.log("Freeze111 :: ", perSecondRoi, totalRoi);
          res.json({
            // status: 200,
            // totalRemainRoi: totalRemainRoi,
            // perSecondRoi: perSecondRoi,
            // totalRoi: totalRoi,
            // referalCommition: totalReferralRoi,
            status: 200,
            freezeAmt: freezeData.freezeAmt,
            objectId: freezeData._id,
            perSecondRoi: perSecondRoi,
            totalRemainRoi: totalRemainRoi,
            totalRefcomision: totalRefcomision,
            totalRoi: totalRoi,
            refferalperSecondRoi: refferalperSecondRoi,
            parentTotalRemaningRoi: parentTotalRemaningRoi,
          });
        });
    }
  } catch (error) {
    console.log("Error in roiIncomeSocket Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function unStake(req, res) {
  try {
    const { Admin } = require("../models/admin");
    const { walletAddr } = req.body;
    userModel.findOne({ walletAddr: walletAddr }).then((walletAddr) => {
      if (walletAddr) {
        roiIncomeSockets(walletAddr.walletAddr).then((a) => {
          if (a.status == 200) {
            freezeModel.findOne({ _id: a.objectId }).then((freezeData) => {
              //send stake amt
              transferTrx(freezeData.walletAddr, a.totalRoi);
              console.log(
                "Freeze Amt :: ",
                Number(freezeData.freezeAmt) + Number(a.totalRoi)
              );

              //update freeze Amt
              freezeModel
                .updateOne(
                  { _id: a.objectId },
                  {
                    $set: { freezeStatus: 2, roiAmount: Number(a.totalRoi) },
                  }
                )
                .then((datata) => {
                  res.json({
                    status: 200,
                    msg: "Successfully updated!",
                  });
                });
            });
          } else {
            res.json({
              status: 400,
              msg: "No value found to unstake!",
            });
          }
        });
      } else {
        res.json({
          status: 400,
          msg: "Inputs are invalid!",
        });
      }
    });
  } catch (error) {
    console.log("Error in unStake Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function referalHarvest(req, res) {
  const { walletAddr } = req.body;
  userModel.findOne({ walletAddr: walletAddr }).then((user) => {
    roiIncomeSockets(user.walletAddr).then((a) => {
      if (a.status == 200) {
        console.log("AAA:: ", a);
        freezeModel.findOne({ _id: a.objectId }).then((freezeData) => {
          // send stake amt
          transferTrx(freezeData.referrerAddr, a.totalRefcomision).then(() => {
            console.log(
              "Freeze Amt :: ",
              Number(freezeData.freezeAmt) + Number(a.totalRoi)
            );
            // update freeze Amt
            // freezeModel
            //   .updateOne(
            //     { _id: a.objectId },
            //     {
            //       $set: {
            //         parentHarvst: Date.now(),
            //         parentroiAmount: Number(a.totalRefcomision),
            //       },
            //     }
            //   )
            //   .then((datata) => {
            //     res.json({
            //       status: 200,
            //       msg: "Successfully updated!",
            //     });
            //   });
          });
        });
      } else {
        res.json({
          status: 400,
          msg: "No value found to unstake!",
        });
      }
    });
  });
}

async function setting(req, res) {
  try {
    const { roiDuration, roiPercentage } = req.body;
    const setting = new Setting({
      roiDuration,
      roiPercentage,
    });
    setting.save((error, data) => {
      if (error) {
        console.log(error);
        res.status(400).json({ message: "somthing went wrong", error });
      }
      if (data) {
        res.status(200).json({ Data: "added.." });
      }
    });
  } catch (error) {
    console.log("Error in setting Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function roiDistribution() {
  try {
    const freez = (await freezeModel.find()).filter(
      (data) => data.freezeEndDuration > Date.now()
    );
    const setting = await Setting.findOne({});
    freez.map((freez) => {
      // console.log(setting.roiPercentage)
      const amount = (freez.freezeAmt * setting.userRoiPercentage) / 100;
      //  userModel.updateOne({walletAddr: freez.walletAddr}, {
      //    $set:{
      //       roiAmount: Number(amount),
      //       freezeStatus: 2
      //    }
      //  })
      console.log(freez.walletAddr, freez.freezeAmt, amount);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getFreez(req, res) {
  try {
    const { walletAddr } = req.body;
    freezeModel.findOne({ walletAddr: walletAddr }).then((data) => {
        res.json({
          status: 200,
          freez: data,
        });
      });
  } catch (error) {
    console.log("Error in getFreez Function!", error.message);
    return res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}
// create revenue
async function createRevenue( walletAddr, revenueFromWalletAddr, amount, revenueType ) {
  const Revenue = require("../models/revenueSchema");
  userModel.find({ walletAddr: walletAddr }).then(async (data) => {
    const revenufrom = userModel.findOne({ walletAddr: revenueFromWalletAddr });
    Revenue.create({
      uniqueId: data.uniqueId,
      walletAddr: data.walletAddr,
      revenueFromUniqueId: revenufrom.uniqueId,
      revenueFromWalletAddr: revenufrom.walletAddr,
      revenueAmt: amount,
      revenueType: revenueType,
    }).then((error, data) => {
      if (error) console.log(error);
      if (data) console.log("revenuCreated");
    });
  });
}

// create history
async function createHistory() {

}

module.exports = {
  test,
  insertUserApi,
  insertAdminApi,
  getTeam,
  freezeApi,
  checkUserExist,
  roiIncomeSocket,
  unStake,
  roiDistribution,
  roiIncomeSockets,
  setting,
  getFreez,
  createRevenue,
  referalHarvest,
};
