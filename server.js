var config = require('./config.js');

// mongoose database initialization
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/' + config.DB, function (err) {
    if (err) {
        console.log("DB connection error:", err);
    } else {
        console.log("DB", config.DB, "up.");
    }
})

// start up express
var express = require('express');
var app = express();

// add post body parsing
var bodyParser = require('body-parser');
app.post('*', bodyParser.json(), bodyParser.urlencoded({ extended: true }));

// add request logging
var logger = require('morgan');
app.use(logger('dev'));

// our public static route for all our miscellaneous files
app.use(express.static('./public'));

// GET: / (root route)
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: './public' });
});

// route handlers
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
