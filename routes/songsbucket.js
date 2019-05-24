const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const Readable = require("stream").Readable
const fs = require("fs")

const SongSchema = require("../models/song");
const connection = require("../database/connection");

const songRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;
const handlePageError = (res, e) => res.setStatus(500).send(e.message);
const Song = SongSchema;
module.exports = songRouter;

let bucket
connection.once("open", () => {
    bucket = new mongoose.mongo.GridFSBucket(connection.db, {bucketName: "songs"})
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
songRouter.get("/" ,(req, res) => {
    return res.json({message: "connect gridfsBucket successfully"})
})

//@route GET /:id
songRouter.get("/:id", (req, res) => {
    let fileId
    try{
        fileId = new ObjectId(req.params.id);
    }catch(err){
        return res.json({err: err})
    }
    console.log(fileId)
    res.setHeader("Content-Type", "audio/mp3");
    res.setHeader("Accept-Ranges", "bytes");

    if(fileId != null){
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
    }else{
        return res.json({message: "Something happen with file id"});
    }
})

songRouter.post("/upload", upload.single("file"), (req, res) => {
    let fileName = req.file.originalname;

    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    let uploadStream = bucket.openUploadStream(fileName);
    let id = uploadStream.id;
    readableStream.pipe(uploadStream);

    uploadStream.on("error", () => {
        return res.status(500).json({message: "Error uploading file"});
    })
    uploadStream.on("finish", () => {
        console.log("Uploading file successfully")
        res.end()
    })
})




// router.get("/", (req, res) => {
//     let songsList = [];
//     Song.find({}, (err, songs) => {
//         if (!songs || songs.length === 0) {
//             return res.json({
//                 err: "no songs exist"
//             })
//         }
//         songs.forEach(song => {

//             //getfilefromsong
//             gfs.files.findOne({ _id: song.fileUpload }, (err, file) => {
//                 //check if files
//                 if (!file || file.length === 0) {
//                     return { err: "no song" };
//                 }
//                 song.getFile = file;
//                 songsList.push(song);
//                 return res.json(songsList);
//             });
//         });
//     });
// });