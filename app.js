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
var replace_comma = '';
var replace_dot = '';
var temp_token_sets = '';
var inputs_into_token = [] ;
var current = '' ;


function WordInfo(word, synsetOffset, pos, lemma, synonyms, gloss){
// assign values to object
  this.word = word;
  this.synsetOffset = synsetOffset;
  this.pos = pos;
  this.lemma = lemma;
  this.gloss = gloss;
  this.synonyms = synonyms;
} // function WordInfo()

var full_text_datasets = []; // 存放整個文章輸入wordnet後的json
  //格式為{ {第一個word的同義詞資訊}, 
  //       {第二個word的同義詞資訊},
  //       {第三個word的同義詞資訊},
  //        ......       }
  // 每一個同義詞資訊是一個object array，其中每個元素都是他的同義詞

function SearchingWordNet( userSearchString, res, req ) {
  var natural = require('natural');
  var wordnet = new natural.WordNet('/usr/local/lib/node_modules/WNdb/dict');
  var i = 0 ;

  //將使用者從text area輸入的文章切token，先把逗號和句號替換成空白，再用空白切
  //可能的bug：萬一有縮寫用到句號的就會被切散成分開的字串 
  replace_comma = String(req.body.userSearchString).replace(/\,/g,' ');
  replace_dot = replace_comma.replace(/\./g,' ');
  temp_token_sets = replace_dot.split(" ");
  inputs_into_token = [] ;
  full_text_datasets = [];

  // 不知道為甚麼split會把雙空白相連的這兩個字元的其中一個當作是內文。。。
  // 還有如果直接del array[3]之類的，array總長度還是不會變（javascript有夠笨 ＝ ＝）
  // ex: var A = ["1", "2", "3"];
  //     del A[1];
  // 印出A會變成：["1", , "3"]
  // 所以重新建立一個新的把不是空的元素丟進去
  for ( var i = 0 ; i < temp_token_sets.length ; i++)  
    if ( temp_token_sets[i].length != 0 ) 
      inputs_into_token.push(temp_token_sets[i]);

  console.log('///' + replace_comma + '\n-------------------');
  console.log(replace_dot + '\n-------------------');
  console.log(inputs_into_token.length + '\n-------------------');
  console.log(inputs_into_token + '\n-------------------');
  // 到這邊就拿到正常的token，可以開始塞進wordnet

  //然後一一餵給wordnet拿出資料
  //並存入json檔中
  for ( walk = 0 ; walk < inputs_into_token.length ; walk++ ) {
    current = inputs_into_token[walk];
    console.log('$ ' + current);

    wordnet.lookup(current, function(results) {
        //console.log('$$ ' + inputs_into_token);
        results.forEach(function(result) {
          //console.log('$$ ' + current);

          var one_wordInfo = new WordInfo(current, 
                                          result.synsetOffset, 
                                          result.pos,
                                          result.lemma,
                                          result.synonyms,
                                          result.gloss );
          wordnetDatas.push(one_wordInfo);
          i++;
        }); // forEach
        //wordnetDatas.slice(0, 0, current);
        //console.log('=======\n' + JSON.stringify(wordnetDatas));
        
        console.log('$$ ' + current);
        console.log('%%', wordnetDatas.length);
        if (wordnetDatas.length > 0)
          full_text_datasets.push(wordnetDatas);

        wordnetDatas = [];
        //console.log('********\n' + JSON.stringify(full_text_datasets));
      } // function(results) 
      
    );
    //console.log('=======\n' + JSON.stringify(wordnetDatas));
    /*
    console.log('$$ ' + current);
      if (wordnetDatas.length > 0)
        full_text_datasets.push(wordnetDatas);

    console.log('********\n' + JSON.stringify(full_text_datasets));*/
  } // for

  res.render('index',{ title: 'NTNU Bioinformatics courses',
                        //wordnetDatas: wordnetDatas,
                        //targetStr : '<a href="www.google.com">test a link </a>' });
                        targetStr : 'You have searched : '+ userSearch });

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
  SearchingWordNet(userSearch, res, req); 
    /* 
  res.render('index',{ title: 'NTNU Bioinformatics courses',
    	                  wordnetDatas: wordnetDatas,
    	                  targetStr : 'You have searched : '+ userSearch });*/
  //wordnetDatas = [];
  //full_text_datasets = [];
});

var output = 'hi';
app.get('/ajax',function(req,res){
  //res.send('hi');
  console.log('app.get: ' + req.body);
  res.send(output);
});

app.post('/ajax',function(req,res){
  //res.send('hi');
  console.log('app.post: ');
  console.log(JSON.stringify(full_text_datasets));
/*
  for ( var j = 0 ; j < full_text_datasets.length ; j++ )
    console.log(JSON.stringify(full_text_datasets[j]));
*/
  output = JSON.stringify(full_text_datasets);
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
	//console.log(userSearch);
	//console.log(wordnetDatas);

    res.render('index', { title: 'NTNU Bioinformatics courses',
    	                  wordnetDatas: wordnetDatas, 
    	                  targetStr : 'You have searched : '+ userSearch});
    // -> render layout.ejs with index.ejs as `body`.
});


app.listen(4649);
console.log('listenning 4649 port');



