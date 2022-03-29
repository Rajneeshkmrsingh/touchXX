const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("../models/admin");
async function signup(req, res) {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin)
      return res.status(400).json({ message: "user already registered" });

    const { email, password, conform_password } = req.body;
    if (password !== conform_password) {
      return res.status(400).json({
        message: "Enter same password",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const _admin = new Admin({
      email,
      hash_password: hash,
    });

    _admin.save((error, data) => {
      if (error) {
        console.log("Error from: adminController >> signup", error.message);
        return res.status(400).json({
          message: "Somthing went wrong",
          error: error.message,
        });
      }
      if (data) {
        // sendMobileOtp(contact, message)
        return res.status(200).json({
          message: "user created successfully",
          data: data,
        });
      }
    });
  } catch (error) {
    console.log("Error from userController >> signup: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function signin(req, res) {
  const Admin = require("../models/admin");
  try {
    Admin.findOne({ email: req.body.email }).then(async (admin, error) => {
      if (error) return res.status(400).json({ error });
      if (admin) {
        console.log(req.body);
        let isValid = bcrypt.compareSync(req.body.password, admin.password);
        if (isValid) {
          const { _id, email, walletName, walletAddr } = admin;
          const token = jwt.sign(
            { _id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          return res.status(200).json({
            token,
            admin: {
              _id,
              email,
              walletName,
              walletAddr,
            },
          });
        } else {
          return res.status(400).json({
            message: "Invalide username and password",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect credentials, user not found.",
        });
      }
    });
  } catch (error) {
    console.log("Error from adminController >> signin: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function allFreezData(req, res) {
  const Freez = require("../models/freezeSchema");
  try {
    await Freez.find(req.body).then((data) => {
      res.json({
        status: 200,
        length: data.length,

        freez: data,
      });
    });
  } catch (error) {
    console.log("Error in getFreez Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function getAllUser(req, res) {
  const User = require("../models/userSchema");
  try {
    User.find(req.body ).then((data) => {
      res.json({
        status: 200,
        freez: data,
      });
    });
  } catch (error) {
    console.log("Error in getFreez Function!", error.message);
    res.json({
      status: 400,
      msg: "Something went wrong!",
    });
  }
}

async function addWallet(req, res) {
  const Admin = require("../models/adminWallet");
  try {
    const { walletAddr, privateKey, walletType } = req.body;
    const wallet = await Admin.findOne({ walletAddr: walletAddr });
    if (wallet) {
      return res.status(400).json({ message: "Wallet already exeist" });
    }
    const createWall = new Admin({
      walletType,
      walletAddr,
      privateKey,
    });
    createWall.save((error, wall) => {
      if (error) {
        console.log("Error from: addWallet", error.message);
        return res.status(400).json({ message: "something went wrong" });
      }
      if (wall) {
        return res.status(200).json({ message: "wallet Added", wall: wall });
      }
    });

    // Admin.updateOne(
    //   { _id: req.body._id },
    //   {
    //     $push: {
    //       walletDetails: {
    //         name: name,
    //         privateKey: privateKey,
    //         walletAddr: walletAddr,
    //       },
    //     },
    //   }
    // ).then((d) => {
    //   return res.status(200).json({ message: "wallet added successfully" });
    // });
  } catch (error) {
    console.log("Error From: adminController >>addWallet ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function getAdminWallet(req, res) {
  const adminWallet = require("../models/adminWallet");
  try{
    adminWallet.find(req.body).then((wall) => {
      return res.status(200).json({msg: "Wallets", wall: wall})
    })

  }catch(error) {
    console.log("Error from: getAdminWallet ", error.message)
    return res.status(400).json({msg: "Somthing went wrong"})
  }
}

async function adminWalletConfig(req, res) {
  const Admin = require("../models/adminWallet");
  try {
    const { walletType, status, walletAddr } = req.body;
    switch (walletType) {
      case "cold_wallet":
        await Admin.updateOne(
          { walletAddr: walletAddr },
          {
            $set: {
              freezOnof: status,
            },
          }
        ).then(() => {
          return res.status(200).json({ message: "success" });
        })
        break;
      case "hot_Wallet":
        Admin.updateOne(
          { walletAddr: walletAddr },
          {
            $set: {
              withdrawlOnof: status,
            },
          }
        ).then(() => {
          return res.status(200).json({ message: "success" });
        })
        break;
    }
    
    // const { configType, status, walletAddr, name } = req.body;
    // adminWalletConfig.find({});
    // // const adminWallet = Admin.findOne({id: req.body>_id}).filter((data) => )
    // Admin.findOneAndUpdate(
    //   { _id: req.body._id, "walletDetails.name": name },
    //   {
    //     $set: {
    //       "walletDetails.$.freezOnof": false,
    //     },
    //   }
    // ).then((d) => {
    //   return res.status(200).json({ message: "success" });
    // });
    // res.status(200).json({ msg: "success" });
  } catch (error) {
    res.status(400).json({ msg: "somthing went wrong" });
  }
}



module.exports = {
  signup,
  signin,
  addWallet,
  adminWalletConfig,
  getAdminWallet,
  allFreezData,
  getAllUser,
};
