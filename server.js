var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var User = require('./app/models/user');
var Product = require('./app/models/product');
var jwt = require('jsonwebtoken');
var config = require('./config');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    next();
});

// logovanje morganom
app.use(morgan('dev'));

// db konekcija
mongoose.connect(config.database);

var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);


app.listen(config.port);
console.log('Magic happens on port ' + config.port);
