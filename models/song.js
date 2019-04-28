import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

const Schema = mongoose.Schema;

const SongSchema = new Schema({
    id: String,
    url: String,
    title: String,
    artist: String,
    img: String,
    isLoved: Boolean
});

SongSchema.plugin(mongoosePaginate);

export default mongoose.model("songs", SongSchema);