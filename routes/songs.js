var express = require("express");
var assign = require("lodash/assign");
var mongoose = require("mongoose");
var conn = require("../database/connection");
var SongSchema = require("../models/song");

var router = express.Router();
module.exports = router;

const handlePageError = (res, e) => res.setStatus(500).send(e.message);

//HTTP GET method
router.get("/", (req, res) => {
    // res.send("list of songs");
    const Song = SongSchema;
    Song.find().then((song) => {
        res.send({song});
    }, (e) => {
        res.status(400).send(e);
    });
});
//HTTP POST method
router.post("/", async(req, res) => {
    try{
        const song = await new SongSchema(req.body).save();

        return res.send({
            message: "create new song successfully",
            data: song
        });
    }catch(e){
        return handlePageError(res, e);
    }
});

//HTTP PUT method
router.put("/:id", async(req, res) => {
    try{
        await Song.findByIdAndUpdate(req.params.id. req.body);

        return res.json({
            message: "Updated post successfully"
        });
    }catch(e){
        return handlePageError(res, e);
    }
});