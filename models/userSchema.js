const mongoose = require('mongoose');

var userSchema = new mongoose.Schema(
    {
        uniqueId: { type: Number, required: true },
        walletName: { type: String, required: true },
        walletAddr: { type: String, unique: true, required: true },
        mnemonicPhrase: { type: [], required: true },
        privateKey: { type: String, unique: true },
        referrerId: { type: String, required: true },
        referrerAddr: { type: String },
        status: { type: Number, default: 1 },
    },
    { timestamps: true, collection: "user" }
)
module.exports = mongoose.model("user", userSchema)