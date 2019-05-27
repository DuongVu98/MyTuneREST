var mongoose = require("mongoose");

const ImageFileSchema = new mongoose.Schema({
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    filename: String,
    md5: String
})

module.exports = mongoose.model("images.files", ImageFileSchema);