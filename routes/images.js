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

imageRouter.get("/:id", (req, res) => {

})

//@route GET /image/:id
imageRouter.get("/image/:id", (req, res) => {
    let fileId
    try {
        fileId = new mongoose.Types.ObjectId(req.params.id)
    } catch (err) {
        return res.json({ err: err })
    }
    console.log("hello")
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
        classification: "avatar",
        imageFileUpload: fileId
    })
    newImage.save((err, song) => {
        if(err) console.log(err)
        else console.log("successfully saved image")
    })
})