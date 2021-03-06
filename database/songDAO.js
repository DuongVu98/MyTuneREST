const mongoose = require("mongoose")
const NodeID3 = require('node-id3')
const Readable = require("stream").Readable

const SongSchema = require("../models/song")
const SongFileSchema = require("../models/songFile")
const connection = require("./connection")

const Song = SongSchema
// const SongFile = SongFileSchema

// module.exports = {
//     getAllSongs : () => {
//         console.log("get all songs")
//         Song.find({}).populate("fileUpload").exec((err, songs) => {
//             if (err) return err
//             // console.log(songs)
//             return songs
//         })
//     },

//     getSongById : (id) => {
//         Song.findOne({ _id: id }).populate("fileUpload").exec((err, song) => {
//             if (err) {
//                 return err
//             } else {
//                 return song
//             }
//         })
//     }
// }

var songDAO = module.exports = {}

songDAO.getAllSongs = () => {
    Song.find({}).populate("fileUpload").exec((err, songs) => {
        if (err) return err
        console.log(songs.length)
        return songs
    })
}

const getSongById = (id) => {
    Song.findOne({ _id: id }).populate("fileUpload").exec((err, song) => {
        if (err) {
            return err
        } else {
            return song
        }
    })
}

const saveSong = (song) => {

    song.save((err, song) => {
        if (err) return err
        return song
    })
}

const deleteSong = (id) => {
    Song.deleteOne({ _id: id }, (err) => {
        if (err) return err
    })
}

// return module.exports