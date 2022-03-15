const mongoose = require('mongoose');

var freezeSchema = new mongoose.Schema(
    {
        uniqueId: { type: Number, required: true },
        walletName: { type: String, required: true },
        walletAddr: { type: String, required: true },
        referrerId: { type: Number, required: true },
        countRoi: { type: Number, required: true, default: 0 },
        roiAmount: { type: Number, required: true, default: 0 },
        totalCountRoi: { type: Number, required: true },
        referrerAddr: { type: String, required: true },
        freezeAmt: { type: Number, required: true },
        freezeStartDuration: { type: Number, required: true },
        freezeEndDuration: { type: Number, required: true },
        freezeStatus: { type: Number, default: 1 },
    },
    { timestamps: true, collection: "freeze" }
)
module.exports = mongoose.model("freeze", freezeSchema)