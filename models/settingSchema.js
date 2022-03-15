const mongoose = require('mongoose');

var settingSchema = new mongoose.Schema({
    roiDuration: { type: Number, required: true },
    userRoiPercentage: { type: Number, required: true },
    parrentroiPercentage: { type: Number, required: true },
}, { timestamps: true, collection: "setting" })
module.exports = mongoose.model("setting", settingSchema)