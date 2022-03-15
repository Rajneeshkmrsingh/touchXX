const userModel = require("../models/userSchema");
const freezeModel = require("../models/freezeSchema");
const Setting = require("../models/settingSchema");
const { Server } = require("socket.io");
const { set } = require("express/lib/response");
const { transferTrx } = require("../utils/transferTRX");
const io = new Server(8081);

io.on("connection", (socket) => {
  // send a message to the client
  socket.on("recieveWalletAddrSocket", (walletAddr) => {
    setInterval(() => {
    console.log("Wallet Addr :: ", walletAddr);
      roiIncomeSockets(walletAddr).then((a) => {
        socket.emit("roiIncomeSocket", a);
      });
    }, 1000);
  });
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
      freezeModel.findOne({  walletAddr: walletAddr,  freezeStatus: 1 })
        .then((freezeData) => {
          if (freezeData) {
            let perSecondRoi = (freezeData.freezeAmt * (1 / 100)) / (60 * 60 * 24);
            if (date < freezeData.freezeEndDuration) {
              let diffTime = date / 1000 - freezeData.freezeStartDuration / 1000;
              let diffRemainTime = freezeData.freezeEndDuration / 1000 - date / 1000;
              let totalRoi = perSecondRoi * diffTime;
              let totalRemainRoi = perSecondRoi * diffRemainTime;
              console.log("Freeze111 :: ", perSecondRoi, totalRoi);

              resolve({
                status: 200,
                freezeAmt: freezeData.freezeAmt,
                objectId: freezeData._id,
                perSecondRoi: perSecondRoi,
                totalRemainRoi: totalRemainRoi,
                totalRoi: totalRoi,
              });
            } else {
              let diffTime = freezeData.freezeEndDuration / 1000 - freezeData.freezeStartDuration / 1000;
              let totalRoi = perSecondRoi * diffTime;
              console.log("Freeze :: ", perSecondRoi, totalRoi);
              resolve({
                status: 200,
                freezeAmt: Number(freezeData.freezeAmt),
                objectId: freezeData._id,
                perSecondRoi: perSecondRoi,
                totalRemainRoi: 0,
                totalRoi: totalRoi,
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
          data: resp,
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
    console.log(userDetail)

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
  const Admin = require("../models/adminWallet")
  try {
    const { walletName, walletAddr, privateKey } = req.body;
    // const isarr = Array.isArray(mnemonicPhrase) ? mnemonicPhrase.length > 0 ? true : false: false;
    if (
      walletAddr &&
      walletName
      // isarr
      ) {
      uniqueIdGenerator().then((uniqueId) => {
        Admin.count({
              uniqueId: uniqueId,
              walletAddr: walletAddr,
              walletName: walletName,
            }).then((resp) => {
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
    const { walletName, walletAddr, referrerAddr, privateKey, mnemonicPhrase } = req.body;
    const isarr = Array.isArray(mnemonicPhrase) ? mnemonicPhrase.length > 0 ? true : false: false;
    if (
      (walletAddr &&
      walletName &&
      privateKey &&
      mnemonicPhrase &&
      isarr) || ( referrerAddr)
    ) {
      uniqueIdGenerator().then((uniqueId) => {
          userModel.count({
              uniqueId: uniqueId,
              walletAddr: walletAddr,
              walletName: walletName,
              privateKey: privateKey,
            })
            .then((resp) => {
              if (resp == 0) {
                getUserDetailsById(referrerAddr).then((userDetail) => {
                  if (userDetail.status) {
                    userModel.create({
                        uniqueId: uniqueId,
                        walletAddr: walletAddr,
                        walletName: walletName,
                        privateKey: privateKey,
                        referrerId: userDetail.data.referrerId,
                        referrerAddr: userDetail.data.walletAddr ? userDetail.data.walletAddr : "",
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

async function freezeApi(req, res) {
  try {
    const { freezeAmt, walletAddr } = req.body;
    if (freezeAmt != undefined && walletAddr != undefined) {
      userModel
        .findOne({ walletAddr: walletAddr })
        .then((resp) => {
          console.log(resp);
          if (resp) {
            if (resp.status == 1) {
              userModel.updateOne(
                  { name: "Central Perk Cafe" },
                  { $set: { violations: 3 } }
                )
                .then(() => {
                  freezeModel.create({
                      uniqueId: resp.uniqueId,
                      walletName: resp.walletName,
                      walletAddr: resp.walletAddr,
                      referrerId: resp.referrerId,
                      referrerAddr: resp.referrerAddr,
                      freezeAmt: Number(freezeAmt),
                      totalCountRoi: 7,
                      freezeStartDuration: new Date().getTime(),
                      freezeEndDuration: new Date().getTime() + 604800000,
                    })
                    .then(() => {
                      res.json({
                        status: 200,
                        msg: "Data Submitted successfully!",
                      });
                    })
                    .catch((error) => {
                      console.log(
                        "Error in freezeApi Function!",
                        error.message
                      );
                      res.json({
                        status: 400,
                        msg: "Something went wrong!",
                      });
                    });
                })
                .catch((error) => {
                  console.log("Error in freezeApi Function!", error.message);
                  res.json({
                    status: 400,
                    msg: "Something went wrong!",
                  });
                });
            } else {
              res.json({
                status: 400,
                msg: "Wallet is already frozen!",
              });
            }
          } else {
            res.json({
              status: 400,
              msg: "Invalid arguments passed!",
            });
          }
        })
        .catch((error) => {
          console.log("Error in freezeApi Function!", error.message);
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
    console.log("Error in freezeApi Function!", error.message);
    res.json({
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
          let diffTime = date / 1000 - freezeData.freezeStartDuration / 1000;
          let diffRemainTime = freezeData.freezeEndDuration / 1000 - date / 1000;
          let perSecondRoi = (freezeData.freezeAmt * (1 / 100)) / (60 * 60 * 24);
          let totalRoi = perSecondRoi * diffTime;
          let totalRemainRoi = perSecondRoi * diffRemainTime;
          res.json({
            status: 200,
            totalRemainRoi: totalRemainRoi,
            perSecondRoi: perSecondRoi,
            totalRoi: totalRoi,
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
    const { Admin } = require('../models/adminWallet')
    const { walletAddr } = req.body;
      userModel.findOne({walletAddr: walletAddr}).then((walletAddr) => {
        if (walletAddr) {
          roiIncomeSockets(walletAddr).then((a) => {
            if (a.status == 200) {
              freezeModel.findOne({_id: a.objectId,})
                .then((freezeData) => {
                  //send stake amt
                  // transferTrx(freezeData.walletAddr, a.totalRoi)
                  console.log("Freeze Amt :: ",Number(freezeData.freezeAmt) + Number(a.totalRoi));
    
                  //update freeze Amt
                  freezeModel.updateOne({_id: a.objectId},
                      {
                        $set: { freezeStatus: 0, roiAmount: Number(a.totalRoi) },
                      }
                    )
                    .then((datata) => {
                      console.log("Resp :: ");
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
      })
      
   
    
  } catch (error) {
    console.log("Error in unStake Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function setting(req, res) {
  try {
    const { roiDuration, roiPercentage } = req.body;
    const setting = new Setting({
      roiDuration,
      roiPercentage,
    })
    setting.save((error, data) => {
      if(error) {
        console.log(error)
        res.status(400).json({ message: "somthing went wrong", error})
      }
      if(data){ 
        res.status(200).json({Data: "added.."})
      }
    })
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
    const freez = (await freezeModel.find()).filter((data) => data.freezeEndDuration > Date.now());
    const setting = await Setting.findOne({})
    freez.map((freez) => {
		// console.log(setting.roiPercentage)
     const amount =  (freez.freezeAmt * setting.userRoiPercentage)/100
    //  userModel.updateOne({walletAddr: freez.walletAddr}, {
    //    $set:{
    //       roiAmount: Number(amount),
    //       freezeStatus: 2 
    //    }
    //  })
		console.log(freez.walletAddr, freez.freezeAmt ,amount)
    });
  } catch (error) {
    console.log(error);
  }
}


async function getFreez(req, res) {
  try{
    const { walletAddr } = req.body
    const freez = await freezeModel.findOne({walletAddr: walletAddr}).then((data) => {
      res.json({
        status: 200,
        freez: freez,
      });
    })
  }catch (error) {
    console.log("Error in getFreez Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function createRevenue(walletAddr,  revenueFromWalletAddr) {
  const Revenue = require('../models/revenueSchema')
  const revenue = await new Revenue({walletAddr})

}

module.exports = {
  test,
  insertUserApi,
  insertAdminApi,
  freezeApi,
  checkUserExist,
  roiIncomeSocket,
  unStake,
  roiDistribution,
  roiIncomeSockets,
  setting,
  getFreez
}
