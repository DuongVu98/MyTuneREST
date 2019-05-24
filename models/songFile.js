var mongoose = require("mongoose");

const SongFileSchema = new mongoose.Schema({
    length: Number,
    chunkSize: Number,
    uploadDate: Date,
    filename: String,
    md5: String
})

module.exports = mongoose.model("songs.files", SongFileSchema);