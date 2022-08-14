require('dotenv').config()
var express = require('express');
var compression = require('compression')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const fileupload=require('express-fileupload')

const passport = require('passport');
require('./routes/passport');
var app = express();
app.use(compression())
app.use(cors());
app.use(fileupload())
app.use(logger('dev'));
app.use(express.json());
app.use(passport.initialize());
app.use('/public',express.static(__dirname+"/public"))
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
var userRoute = require('./routes/main.route');
app.use('/', userRoute);
app.listen(5000)