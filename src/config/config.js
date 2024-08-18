require('dotenv').config();




module.exports = {
    port: process.env.PORT ,
    mongodbUri: process.env.dbURI,
    
};