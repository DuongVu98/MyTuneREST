var express = require("express");
var bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Application listen on port: " + port);
});

var songs = require("./routes/songs.js");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/api/songs", songs);

app.get("/", (req, res) => {
    return res.send("Welcome to MyTune")
});