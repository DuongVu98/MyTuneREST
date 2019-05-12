var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const SongSchema = new Schema({
    id: String,
    url: String,
    title: String,
    artist: String,
    img: String,
    isLoved: Boolean,
    fileUpload: {
        type: Schema.ObjectId,
        ref: "uploads.files"
    }
});

SongSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("songs", SongSchema);