const mongoose = require("mongoose");
var historySchema = new mongoose.Schema(
    {
        uniqueId: { type: Number, required: true },
        walletAddr: { type: String, required: true },
        revenueFromUniqueId: { type: Number, required: true },
        revenueFromWalletAddr: { type: String, required: true },
        revenueAmt: { type: Number, required: true },
        revenueType: { type: Number, }
    },
    { timestamps: true, collection: "history" }
)
module.exports = mongoose.model("history", historySchema)