const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const app = express();
const port = process.env.PORT || 3000;

const songs = require("./routes/songs.js");

app.listen(port, () => {
    console.log("Application listen on port: " + port);
});


app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use("/api/songs", songs);

app.get("/", (req, res) => {
    return res.send("Welcome to MyTune")
    // return res.render("index");
});