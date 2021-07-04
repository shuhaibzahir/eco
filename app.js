var createError = require('http-errors');
var express = require('express');
require('dotenv').config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
 
var admin = require('./routes/admin');
var usersRouter = require('./routes/users');
var session = require('express-session')
const db = require("./config/db");
const fileUpload = require('express-fileupload')
 
var app = express();
// db connecting
db.dbConnect(process.env.DB_URL)
// view engine setup
var hbs = exphbs.create({
  helpers: {
    ifEqual: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    ge: function( a, b ){
      var next =  arguments[arguments.length-1];
      return (a >= b) ? next.fn(this) : next.inverse(this);
    },
    ne: function( a, b ){
      var next =  arguments[arguments.length-1];
      return (a !== b) ? next.fn(this) : next.inverse(this);
    },
    gt:function( a, b ){
      var next =  arguments[arguments.length-1];
      return (a > b) ? next.fn(this) : next.inverse(this);
    }
  },
  defaultLayout: 'layout',
   extname: '.hbs',
   layoutsDir: path.join(__dirname, "views/layouts"),
   partialsDir: path.join(__dirname, "/views/partials")
 
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine)
 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false,
  limit:'50mb'
}));
app.use(fileUpload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
   saveUninitialized: true,
  cookie : {
    maxAge : 40 * 60 * 1000
  },
}))
app.use('/admin', admin);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500 );
  res.render('error');
});

module.exports = app;