const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    username: String,
    password: String,
    dob: Date,
    email: String,
    avatar: String,
    playList: [
        {
            type: Schema.Types.ObjectId,
            ref: "songs.files"
        }
    ]
});

UserSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("users", UserSchema);