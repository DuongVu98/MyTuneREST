var mongoose = require("mongoose");

const dbUrl = "mongodb+srv://Tony:1234@myfirstdb-1slkm.gcp.mongodb.net/test?retryWrites=true";
const conn = mongoose.createConnection(dbUrl, (error) => {
    if(error){
        console.log("Error: " + error);
    }else{
        console.log("Connected successfully to database");
    }
});

module.exports = conn;