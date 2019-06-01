const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Readable = require("stream").Readable
const fs = require("fs")

const ImageSchema = require("../models/image")
const ImageFileSchema = require("../models/imageFile")
const connection = require("../database/connection")

const imageRouter = express.Router();

const handlePageError = (res, e) => res.setStatus(500).send(e.message)
const Image = ImageSchema
const ImageFile = ImageFileSchema

module.exports = imageRouter

let bucket
connection.once("open", () => {
    bucket = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: "images" })
})
const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {
        fields: 1,
        fileSize: 6000000,
        files: 1,
        parts: 2
    }
})

imageRouter.get("/", (req, res) => {
    Image.find({}).populate("imageFileUpload").exec((err, images) => {
        if (err) return handlePageError(res, err)
        return res.status(200).json(images);
    })
})

//@route GET /image/:id
imageRouter.get("/file-image/:id", (req, res) => {
    let fileId
    try {
        fileId = new mongoose.Types.ObjectId(req.params.id)
    } catch (err) {
        return res.json({ err: err })
    }

    //set header for download
    res.setHeader("Content-Type", "image/jpeg")
    res.setHeader("Accept-Ranges", "bytes")

    if (fileId != null) {
        let downloadStream = bucket.openDownloadStream(fileId)
        downloadStream.on("data", (chunk) => {
            res.write(chunk)
        })

        downloadStream.on("error", () => {
            res.sendStatus(404)
        });
        downloadStream.on("end", () => {
            console.log("Download successfully with file: " + fileId)
            res.end()
        });
    } else {
        return res.json({ message: "Something happen with file id" });
    }
})

//@route GET /file-image/default-image
imageRouter.get("/default-image", (req, res) => {
    let defaultImageStream = fs.createReadStream("./res/defaultImg.png")
    defaultImageStream.on("data", (data) => {
        console.log(data)
        res.write(data)
    })
    defaultImageStream.on("error", () => {
        res.sendStatus(404)
    });
    defaultImageStream.on("end", () => {
        res.end()
    })
})

//@route POST /upload
imageRouter.post("/upload", upload.single("file"), (req, res) => {

    let fileName = req.file.originalname
    const readableStream = new Readable()
    readableStream.push(req.file.buffer)
    readableStream.push(null)

    let uploadStream = bucket.openUploadStream(fileName)
    let fileId = uploadStream.id
    readableStream.pipe(uploadStream)

    uploadStream.on("error", () => {
        return res.status(500).json({ message: "Error uploading file" });
    })
    uploadStream.on("finish", () => {
        console.log("Uploading file successfully")
        res.end()
    })

    let newImage = new Image({
        imageName: "some image name",
        url: "mytune-service.herokuapp.com/api/images/file-image/" + fileId,
        classification: req.body.classification,
        imageFileUpload: fileId
    })
    newImage.save((err, image) => {
        if (err) console.log(err)
        else console.log("successfully saved image: " + image)
    })
})

imageRouter.delete("/delete/:id", (req, res) => {

    Image.findOne({ _id: req.params.id }).populate("imageFileUpload").exec((err, image) => {
        if (err) return res.json({ err: "find image error" })

        console.log("id to delete: " + image.imageFileUpload)

        bucket.delete(image.imageFileUpload._id, (err) => {
            if(err) return res.json({err: "bucket delete error "+err})

            Image.deleteOne({_id: req.params.id}, (err) => {
                if(err) return json({message: "model delete error"})
                return res.json({ message: "delete successfully" })
            }) 
        }) 
    })
})