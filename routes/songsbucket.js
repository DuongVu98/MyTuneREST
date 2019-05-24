const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Readable = require("stream").Readable
const fs = require("fs")

const SongSchema = require("../models/song");
const SongFileSchema = require("../models/songFile");
const connection = require("../database/connection");

const songRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;
const handlePageError = (res, e) => res.setStatus(500).send(e.message);

const Song = SongSchema;
const SongFile = SongFileSchema;

module.exports = songRouter;

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
    return res.json({ message: "connect gridfsBucket successfully" })
})

//@route GET /:id
songRouter.get("/:id", (req, res) => {
    SongFile.findOne({ _id: req.params.id }, (err, songFile) => {
        if (err) return handlePageError(err);
        else if (songFile === null) return res.json({ message: "no song file" });
    })

    let fileId
    try {
        fileId = new ObjectId(req.params.id);
    } catch (err) {
        return res.json({ err: err })
    }
    console.log(fileId)
    res.setHeader("Content-Type", "audio/mp3");
    res.setHeader("Accept-Ranges", "bytes");

    if (fileId != null) {
        let downloadStream = bucket.openDownloadStream(fileId)
        downloadStream.on("data", (chunk) => {
            res.write(chunk);
        })

        downloadStream.on("error", () => {
            res.sendStatus(404);
        });
        downloadStream.on("end", () => {
            console.log("Download successfully with file: " + fileId)
            res.end();
        });
    } else {
        return res.json({ message: "Something happen with file id" });
    }
})

songRouter.post("/upload", upload.single("file"), (req, res) => {

    // Upload File 
    let fileName = req.file.originalname;

    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    let uploadStream = bucket.openUploadStream(fileName);
    let fileId = uploadStream.id;
    readableStream.pipe(uploadStream);

    uploadStream.on("error", () => {
        return res.status(500).json({ message: "Error uploading file" });
    })
    uploadStream.on("finish", () => {
        console.log("Uploading file successfully")
        res.end()
    })

    
    // Save new song to collection
    let newSong = new Song({
        id: 1,
        url: "something",
        title: "song title",
        artist: "song artist",
        img: "some image",
        isLoved: false,
        fileUpload: fileId,
        getFile: null
    });
    newSong.save((err, song) => {
        if(err) console.log("song error: " + err)
        else console.log("successfully saved song: " + song);
    });
})
