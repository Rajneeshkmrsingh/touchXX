const mongoose = require("mongoose");

var adminSchema = new mongoose.Schema(
  {
    uniqueId: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    walletName: { type: String, required: true },
    walletAddr: { type: String, unique: true, required: true },
    walletDetails: [
      {
          name: { type: String },
        walletAddr: { type: String, unique: true },
        privateKey: { type: String, unique: true },
        freezOnof: { type: Boolean, default: true },
        withdrawlOnof: { type: Boolean, default: true },
      },
    ],
    mnemonicPhrase: { type: [], required: true },
    privateKey: { type: String, unique: true },
    status: { type: Number, default: 1 },
  },
  { timestamps: true, collection: "admin" }
);
module.exports = mongoose.model("admin", adminSchema);
