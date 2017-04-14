var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const MongoCient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017/mongodb-prot';

MongoCient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log('connection successfully to server');

	removeDocument(db, function() {
		findAllDocuments(db, function() {
			db.close();
		})
	});
});

function insertDocuments(db, callback) {
	let collection = db.collection('documents');
	collection.insertMany([
		{a : 1}, {a : 2}, {a : 3}
		], function(err, result) {
			assert.equal(err, null);
			assert.equal(3, result.result.n);
			assert.equal(3, result.ops.length);
			console.log('inserted 3 documents into the collection');
			callback(result);
		});
}

function findAllDocuments(db, callback) {
	let collection = db.collection('documents');
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log('Found the following records');
		console.log(docs);
		callback(docs);
	});
}

function findDocument(db, callback) {
	let collection = db.collection('documents');
	collection.find({'a': 3}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log('Found record');
		console.log(docs);
		callback(docs);
	});
}

function updateDocment(db, callback) {
	const collection = db.collection('documents');
	collection.updateOne({'a': 2},
		{ $set: {'b': 1} }, function(err, result) {
			assert.equal(err, null);
			assert.equal(1, result.result.n);
			console.log('Updated the document with the field a equal to 2');
			callback(result);
		});
}

function removeDocument(db, callback) {
	const collection = db.collection('documents');
	collection.deleteOne({'a': 3}, function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		console.log('Removed the document with the field a equal to 3');
		callback(result);
	});
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
