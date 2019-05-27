const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const ImageSchema = new mongoose.Schema({
    imageName: String,
    url: String,
    classification: String,
    imageFileUpload: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "images.files"
    }
})

ImageSchema.plugin(mongoosePaginate)

module.exports = mongoose.model("images", ImageSchema)