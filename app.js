// server.js
// load the things we need
var express = require('express');
var app = express();

var routes = require('./routes/index');
var users = require('./routes/users');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http');

// set the view engine to ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set("view options", {layout: false});
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
app.use(logger('dev'));
app.use('/', routes);
app.use('/users', users);

//app.get('/ajax', routes.ajax);

//using bodyParser and POST for catching html inputss
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
/*
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});*/
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//module.exports = app;

// searching wordNet...
var userSearch = 'network';
var wordnetDatas = [];

function WordInfo(synsetOffset, pos, lemma, synonyms, gloss){
// assign values to object
  this.synsetOffset = synsetOffset;
  this.pos = pos;
  this.lemma = lemma;
  this.gloss = gloss;
  this.synonyms = synonyms;
} // function WordInfo()

function SearchingWordNet( userSearchString, res ) {
  var natural = require('natural');
  var wordnet = new natural.WordNet('/usr/local/lib/node_modules/WNdb/dict');
  var i = 0 ;
  

  wordnet.lookup(String(userSearch), function(results) {
      results.forEach(function(result) {
        var one_wordInfo = new WordInfo(result.synsetOffset, 
                                        result.pos,
                                        result.lemma,
                                        result.synonyms,
                                        result.gloss );
        wordnetDatas[i]  = one_wordInfo;
        i++;
      });
      //return wordnetDatas;
      res.render('index',{ title: 'NTNU Bioinformatics courses',
    	                  wordnetDatas: wordnetDatas,
                        //targetStr : '<a href="www.google.com">test a link </a>' });
    	                  targetStr : 'You have searched : '+ userSearch });
  });
} // SearchingWordNet()
/*
// ajax communicatetion
app.get('/ajax', function(res, req){
  res.send(req.body);
  console.log(req.body);
});*/

app.post('/', function(req, res){
	console.log('app.post: @app.js');
	userSearch = req.body.userSearchString;
    console.log(userSearch);
    SearchingWordNet(userSearch, res);
    /*
    res.render('index',{ title: 'NTNU Bioinformatics courses',
    	                  wordnetDatas: wordnetDatas,
    	                  targetStr : 'You have searched : '+ userSearch });*/
    wordnetDatas = [];
});

var output = 'hi';
app.get('/ajax',function(req,res){
  //res.send('hi');
  console.log('app.get: ' + req.body);
  res.send(output);
});

app.post('/ajax',function(req,res){
  //res.send('hi');
  console.log('app.post: '+  JSON.stringify(req.body));
  output = JSON.stringify(req.body);
  res.json(output);
  //res.send(output);
});

// create web page : about0~about2
for (var i = 0 ; i < 3 ; i++) {
  app.get('/about'+i, function(req,res, app){
    res.send('page00');
  });
} // for


// 'You have searched : ' + userSearch
app.get('/',function(req,res){
	console.log('app.get: @app.js');
	//SearchingWordNet(userSearch);
	console.log(userSearch);
	console.log(wordnetDatas);

    res.render('index', { title: 'NTNU Bioinformatics courses',
    	                  wordnetDatas: wordnetDatas, 
    	                  targetStr : 'You have searched : '+ userSearch});
    // -> render layout.ejs with index.ejs as `body`.
});


app.listen(4649);
console.log('listenning 4649 port');



