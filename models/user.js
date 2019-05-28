var mongoose = require("mongoose");

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

module.exports = mongoose.model("users", UserSchema);