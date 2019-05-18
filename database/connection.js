var mongoose = require("mongoose");

const dbUrl = "mongodb+srv://Tony:1234@myfirstdb-1slkm.gcp.mongodb.net/test?retryWrites=true";

mongoose.connect(dbUrl, {useNewUrlParser: true});
connection = mongoose.connection;

connection.on('error', () => {
    console.error.bind(console, 'Connection error!!!')
})

module.exports = connection;