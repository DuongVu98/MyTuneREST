const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const Schema = mongoose.Schema

const SongSchema = new Schema({
    url: String,
    title: String,
    artist: String,
    album: String,
    genre: String,
    image: {
        type: Schema.Types.ObjectId,
        ref: "images.files"
    },
    imageUrl: String,
    isLoved: Boolean,
    fileUpload: {
        type: Schema.Types.ObjectId,
        ref: "songs.files"
    }
});

SongSchema.plugin(mongoosePaginate)

SongSchema.statics.getAllSongs = () => {
    this.model.find({}).populate("fileUpload").exec((err, songs) => {
        if (err) return err
        console.log(songs.length)
        return songs
    })
}

module.exports = mongoose.model("songs", SongSchema)