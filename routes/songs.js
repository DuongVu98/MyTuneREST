const express = require("express");
const assign = require("lodash/assign");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const ObjectId = mongoose.Types.ObjectId;

const SongSchema = require("../models/song");
const connection = require("../database/connection");
const router = express.Router();
module.exports = router;

const handlePageError = (res, e) => res.setStatus(500).send(e.message);
const mongoURI = "mongodb+srv://Tony:1234@myfirstdb-1slkm.gcp.mongodb.net/test?retryWrites=true";
const Song = SongSchema;

let gfs;
connection.once("open", () => {
    //init stream
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection("uploads");
});

//init storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                // const filename = buf.toString("hex") + path.extname(file.originalname);
                const filename = file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads"
                };
                resolve(fileInfo);
            });
        });
    },
});
const upload = multer({ storage });

//@route for index.ejs
router.get("/index",(req, res) => {
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            res.render("index", { files: false });
        } else {
            files.map(file => {
                if (file.contentType === "image/jpeg" || file.contentType === "img/png" || file.contentType === "image/png") {
                    file.isImage = true;
                    // file.isAudio = false;
                } else if (file.contentType === "audio/mp3") {
                    // file.isAudio = true;
                    file.isImage = false;
                } else {
                    file.isImage = false;
                    // file.isAudio = false;
                }
            });
            res.render("index", { files: files });
        }
    });
})

//@route GET /
//load form
router.get("/", (req, res) => {
    let songsList = [];
    Song.find({}, (err, songs) => {
        if (!songs || songs.length === 0) {
            return res.json({
                err: "no songs exist"
            })
        }
        songs.forEach(song => {

            //getfilefromsong
            gfs.files.findOne({ _id: song.fileUpload }, (err, file) => {
                //check if files
                if (!file || file.length === 0) {
                    return { err: "no song" };
                }
                song.getFile = file;
                songsList.push(song);
                return res.json(songsList);
            });
        });
    });
});
router.get("/:id", (req, res) => {
    Song.findOne({ id: req.params.id }, (err, song) => {
        if (err) return handlePageError(res, err);
        if (song === null) return res.json({err: "no song"})
        gfs.files.findOne({ _id: song.fileUpload }, (err, file) => {
            //check if files
            if (!file || file.length === 0) {
                return res.status(404).json({
                    err: "no files exist"
                });
            }
            song.getFile = file;
            return res.json(song);
        });

        
    });
});
router.get("/:id/audio", (req, res) => {
    Song.findOne({id: req.params.id}, (err, song) => {
        gfs.files.findOne({ _id: song.fileUpload }, (err, file) => {

            if(err) console.log(err)

            //check if files
            if (!file || file.length === 0) {
                return res.status(404).json({
                    err: "no files exist"
                });
            }
            //check if image
            if (file.contentType === "audio/mp3") {
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            } else {
                res.status(404).json({
                    err: "not an audio"
                });
            }
        });
    })
})

//@route POST /upload
router.post("/upload", upload.single("file"), (req, res) => {
    let fileUpload = req.file.filename;
    gfs.files.findOne({ filename: fileUpload }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: "no files exist"
            });
        }
        fileId = file._id;
        console.log(fileId);
        let data = {
            id: 1,
            url: "something",
            title: "song title",
            artist: "song artist",
            img: "some image",
            isLoved: false,
            fileUpload: fileId,
            getFile: null
        };
        let newSong = new Song(data);
        console.log(newSong);
        newSong.save((err, newSong) => {
            if (err) console.log("song error: " + err);
            else console.log("saved - " + newSong);
        });
        res.redirect("/api/songs");
    });
});

//@route DELETE /id
router.delete("/id/:id", (req, res) => {
    Song.findOne({id: req.song.id}, (err, song) => {
        if(err) return handlePageError(res, err)
        else if (song === null) return res.status(404).json({err: "no song"})

        gfs.remove({ _id: song.fileUpload, root: "uploads" }, (err, GridFsStorage) => {
            if (err) {
                return res.status(404).json({ err: err });
            }
        });
        Song.deleteOne(song, (err) => {
            return handlePageError(res, err)
        })
        return res.json({message: "delete successfully"})
    })
    
});

//@route GET /image/:filename
//display image
router.get("/image/:filename", (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        //check if files
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: "no files exist"
            });
        }
        //check if image
        if (file.contentType === "image/jpeg" || file.contentType === "img/png" || file.contentType === "image/png") {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: "not an image"
            });
        }
    });
});



// these are for index checking
//@route GET /audio/:filename
router.get("/audio/:filename", (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        //check if files
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: "no files exist"
            });
        }
        //check if image
        if (file.contentType === "audio/mp3") {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: "not an audio"
            });
        }
    });
});

//@route DELETE /file:id
//@desc DELETE file
router.delete("/files/:id", (req, res) => {
    gfs.remove({ _id: req.params.id, root: "uploads" }, (err, GridFsStorage) => {
        if (err) {
            return res.status(404).json({ err: err });
        }
        res.redirect("/api/songs");
    });
});