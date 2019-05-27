const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const Schema = mongoose.Schema

const SongSchema = new Schema({
    id: String,
    url: String,
    title: String,
    artist: String,
    image: {
        type: Schema.Types.ObjectId,
        ref: "images.files"
    },
    isLoved: Boolean,
    fileUpload: {
        type: Schema.Types.ObjectId,
        ref: "songs.files"
    }
});

SongSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("songs", SongSchema)