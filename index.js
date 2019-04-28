const express = require("express");
const app = express();
var bodyParser = require("body-parser");
const port = 3000;
app.listen(port, () => {
    console.log("Application listen on port: " + port);
});

var songs = require("./routes/songs.js");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/songs", songs);

app.get("/", (req, res) => {
    return res.send("Welcome to MyTune")
});