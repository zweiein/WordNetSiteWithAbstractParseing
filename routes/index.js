var express = require('express');
var router = express.Router();
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var initialMsg = 'Please Enter the keyword you want to search...';
var link ='<a href="www.google.com">test a link </a>';
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

function SearchingWordNet( userSearchString ) {
  var natural = require('natural');
  var wordnet = new natural.WordNet('/usr/local/lib/node_modules/WNdb/dict');
  var i = 0 ;
  wordnetDatas = [];

  wordnet.lookup(String(userSearch), function(results) {
      results.forEach(function(result) {
        var one_wordInfo = new WordInfo(result.wordInfo,
                                        result.synsetOffset, 
                                        result.pos,
                                        result.lemma,
                                        result.synonyms,
                                        result.gloss );
        wordnetDatas[i]  = one_wordInfo;
        i++;
      });
      return wordnetDatas;
  });
} // SearchingWordNet()

//SearchingWordNet('network');

/*
// ajax communicatetion
router.get('/ajax', function(res, req){
  //res.send(req.body);
  res.send('new page!');
  console.log(req.body);
});*/
/*
exports.ajax = function(req, res) {
  console.log(req.body);
};*/

// GET home page. 
router.get('/',function(req,res){
	console.log('------------\nrouter.get: @index.js');
	//SearchingWordNet(userSearch);
	console.log(userSearch);

    res.render('index', { title: 'NTNU Bioinformatics courses',
    	                  wordnetDatas: [],
    	                  targetStr : initialMsg });
    // wordnetDatas = [];
});

module.exports = router;

