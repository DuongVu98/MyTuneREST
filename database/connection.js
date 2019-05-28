var mongoose = require("mongoose");

// const dbUrl = "mongodb+srv://Tony:1234@myfirstdb-1slkm.gcp.mongodb.net/test?retryWrites=true"
const dbUrl = "mongodb://vtduong:vtduong@206.189.40.187:27017/MyTune?authSource=admin"
// const dbUrl = "mongodb://206.189.40.187:27017/MyTune"
mongoose.connect(dbUrl , {useNewUrlParser: true})
connection = mongoose.connection

connection.on('error', () => {
    console.error.bind(console, 'Connection error!!!')
})
connection.on("open", () => {
    console.log("connection successfully")
})

module.exports = connection