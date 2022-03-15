const mongoose = require('mongoose');

var adminSchema = new mongoose.Schema(
    {
        uniqueId: { type: Number, required: true },
        walletName: { type: String, required: true },
        walletAddr: { type: String, unique: true, required: true },
        mnemonicPhrase: { type: [], required: true },
        privateKey: { type: String, unique: true },
        status: { type: Number, default: 1 },
    },
    { timestamps: true, collection: "admin" }
)
module.exports = mongoose.model("admin", adminSchema)