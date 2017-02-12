var config = require('./config.js');

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/' + config.DB, function (err) {
    if (err) {
        console.log("DB connection error:", err);
    } else {
        console.log("DB", config.DB, "up.");
    }
})

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));

require('morgan')('dev')

var teamRoutes = require('./routes/teamRoutes.js');
teamRoutes(app);
var pageRoutes = require('./routes/pageRoutes.js');
pageRoutes(app);

// set up HTTP listener
var PORT = process.env.PORT || config.PORT || 8080
app.listen(PORT, function (err) {
    if (err) {
        console.log("Server failure:", err)
        process.exit(1);
    }
    console.log("Server up on port " + PORT + ".")
})
