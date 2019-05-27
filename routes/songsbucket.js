const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")
const Readable = require("stream").Readable
const fs = require("fs")

const SongSchema = require("../models/song")
const SongFileSchema = require("../models/songFile")
const connection = require("../database/connection")

const songRouter = express.Router()
const ObjectId = mongoose.Types.ObjectId
const handlePageError = (res, e) => res.setStatus(500).send(e.message)

const Song = SongSchema
const SongFile = SongFileSchema

module.exports = songRouter

let bucket
connection.once("open", () => {
    bucket = new mongoose.mongo.GridFSBucket(connection.db, { bucketName: "songs" })
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


//@route GET /
songRouter.get("/", (req, res) => {
    Song.find({}).populate("fileUpload").exec((err, songs) => {
        if (err) return handlePageError(res, err)
        return res.status(200).json(songs)
    })
})

songRouter.get("/:id", (req, res) => {
    Song.findOne({ _id: req.params.id }).populate("fileUpload").exec((err, song) => {
        if (err) {
            console.log("error populate")
        } else {
            return res.status(200).json(song)
        }
    })
})
//@route GET /:id/audio
songRouter.get("/audio/:id", (req, res) => {

    Song.findOne({ _id: req.params.id }).populate("fileUpload").exec((err, song) => {
        console.log(song);

        let fileId
        try {
            fileId = new ObjectId(song.fileUpload._id)
        } catch (err) {
            return res.json({ err: err })
        }
        console.log(fileId)
        res.setHeader("Content-Type", "audio/mp3")
        res.setHeader("Accept-Ranges", "bytes")
        res.setHeader("Content-Length", song.fileUpload.length)

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
            return res.json({ message: "Something happen with file id" })
        }
    })
})

songRouter.get("/file-audio/:id", (req, res) => {
    let fileId
    try {
        fileId = new ObjectId(req.params.id);
    } catch (err) {
        return res.json({ err: err })
    }
    console.log(fileId)
    SongFile.findOne({ _id: fileId }, (err, songFile) => {

        if(err) return handlePageError(res, err)

        res.setHeader("Content-Type", "audio/mp3")
        res.setHeader("Accept-Ranges", "bytes")
        res.setHeader("Content-Length", songFile.length)

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
                res.end();
            });
        }
    })

})
songRouter.post("/upload", upload.single("file"), (req, res) => {

    // Upload File 
    let fileName = req.file.originalname

    const readableStream = new Readable()
    readableStream.push(req.file.buffer)
    readableStream.push(null)

    let uploadStream = bucket.openUploadStream(fileName)
    let fileId = uploadStream.id
    readableStream.pipe(uploadStream)

    uploadStream.on("error", () => {
        return res.status(500).json({ message: "Error uploading file" })
    })
    uploadStream.on("finish", () => {
        console.log("Uploading file successfully")
        res.end()
    })


    // Save new song to collection
    // should be req.body
    let newSong = new Song({
        id: 1,
        url: "mytune-service.herokuapp.com/api/songs/file-audio/" + fileId,
        title: "song title",
        artist: "song artist",
        image: null,
        isLoved: false,
        fileUpload: fileId,
        getFile: null
    })
    newSong.save((err, song) => {
        if (err) console.log("song error: " + err)
        else console.log("successfully saved song: " + song)
    })
})
