const mongoose = require("mongoose");

var adminWallet = new mongoose.Schema(
  {
        walletAddr: { type: String, unique: true },
        privateKey: { type: String, unique: true },
        freezOnof: { type: Boolean, default: true },
        withdrawlOnof: { type: Boolean, default: true },
        walletType: {type: String}
      },
  { timestamps: true, collection: "adminWallet" }
);
module.exports = mongoose.model("adminWallet", adminWallet);
