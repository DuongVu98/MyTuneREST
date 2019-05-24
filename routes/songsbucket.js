const express = require("express");
const assign = require("lodash/assign");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const Readable = require("stream").Readable
const fs = require("fs")

const SongSchema = require("../models/song");
const connection = require("../database/connection");

const router = express.Router();
const ObjectId = mongoose.Types.ObjectId;
const handlePageError = (res, e) => res.setStatus(500).send(e.message);
const Song = SongSchema;
module.exports = router;

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
router.get("/" ,(req, res) => {
    return res.json({message: "connect gridfsBucket successfully"})
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