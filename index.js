// ### Libraries and globals

// This bot works by inspecting the front page of Google News. So we need
// to use `request` to make HTTP requests, `cheerio` to parse the page using
// a jQuery-like API, `underscore.deferred` for [promises](http://otaqui.com/blog/1637/introducing-javascript-promises-aka-futures-in-google-chrome-canary/),
// and `twit` as our Twitter API library.
var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore.deferred');
var config = require('./config.js');
var Twit = require('twit');
var T = new Twit(config);
var pos = require('pos');
var spells = require('./mispel.js');


var baseUrl = 'http://news.google.com';


// ### Utility Functions

var logger = function(msg) {
  if (config.log) console.log(msg);
};


// adding to array.prototype caused issues with nlp_compromise
// get random element from array
var pick = function(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
};

// get a random element from an array
// then remove that element so we can't get it again.
var pickRemove = function(arr) {
  var index = Math.floor(Math.random()*arr.length);
  return arr.splice(index,1)[0];
};


var getRandom = function(min,max) {

  if (arguments.length == 1) {
    max = min;
    min = 0;
  }

  return Math.floor(Math.random() * (max - min) + min);
};

// return true or false
// 50-50 chance (unless override)
var coinflip = function(chance) {
  if (!chance) { chance = 0.5; }
  return (Math.random() < chance);
};


var stripWord = function(word) {

  // let punctuation and possessives remain
  // TODO: unit-tests for various errors we encounter
  // Venice's := Venice
  // VENICE'S := VENICE
  // etc.
  var removals = ['"', ':', '-', ',', '\'s$', '\\(', '\\)', '\\[', '\\]' ];

  for (var i = 0 ; i < removals.length; i++) {
    var r = removals[i];
    word = word.replace(new RegExp(r, 'i'), '');
  }

  return word;
};

var getNounArray = function(headline) {
  // original implementation
  // return getNounArrayCompromise(headline);
  return getNounArrayPos(headline);
};

var getNounArrayPos = function(headline) {

  //  var pos = require('pos');
  //  var s = 'Embattled Oregon Governor Says He Will Resign'
  //  var words = new pos.Lexer().lex(s);
  //  var taggedWords = new pos.Tagger().tag(words);
  //  taggedWords
  // [ [ 'Embattled', 'JJ' ],
  //   [ 'Oregon', 'NNP' ],
  //   [ 'Governor', 'NNP' ],
  //   [ 'Says', 'VBZ' ],
  //   [ 'He', 'PRP' ],
  //   [ 'Will', 'MD' ],
  //   [ 'Resign', 'VB' ] ]
  var nn = [];
  var currn = [];
  var active = false;
  var targetPos = 'NNPSNNS'; // NN, NNP, NNPS, NNS
  var words = new pos.Lexer().lex(headline);
  var taggedWords = new pos.Tagger().tag(words);
  for (var i in taggedWords) {
    var taggedWord = taggedWords[i];
    if (targetPos.indexOf(taggedWord[1]) > -1) {
      // consider sequention nouns to be a noun-phrase
      // this is probably a crap algorithm
      currn.push(taggedWord[0]);
    } else {
      if (currn.length > 0) {
        nn.push(currn.join(' '));
        currn = [];
      }
    }
  }

  return nn;

};


var getGoatWord = function() {

  // TODO: nice to rank these, somehow....
  var goats = [
    'goat',
    'goat',
    'goat',
    'goat',
    'goat',
    'goat',
    'goat',
    'goat',
    'goat',
    'goat',
    'goat',
    'THE GOAT!',
    'wild goat',
    'domestic goat',
    'capra aegagrus hircus',
    'wild goat',
    'domestic goat',
    'capra aegagrus hircus',
    'wild goat',
    'domestic goat',
    'magnificent goat',
    'hirsute wonder',
    'wondrous goat',
    'amazing goat',
    'beloved goat',
    'caprinae',
    'doe',
    'nanny goat',
    'buck',
    'billy goat',
    'ram',
    'kid goat',
    'wether',
    'modern Ibex',
    'small livestock animal',
    'dung-producer',
    'dung',
    'zodiac beast',
    'zodiac animal',
    'bearded animal',
    'bearded beast',
    'noble beast',
    'mohair',
    'mohair provider',
    'feta source',
    'mixed-up toga',
    'grass',
    'tin cans',
    'horn',
    'nimble mountain animal',
    'mountain dweller',
    'shears'
  ];

  return pick(goats);

};

// TODO: we should _match_ capitalization
// if all caps, all-caps it!
var isFirstLetterUpperCase = function(str) {
  return (str.charAt(0).toUpperCase() == str.charAt(0));
};

var capitalize = function(phrase) {

  var cphrase = [];
  var splits = phrase.split(' ');
  for (var i = 0; i < splits.length; i++) {
    cphrase.push(capitalizeWord(splits[i]));
  }

  return cphrase.join(' ');

};

var capitalizeWord = function(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

var isVowell = function(letter) {
    return /^[aeiou]/i.test(letter);
};

// creative respellings
// http://security.stackexchange.com/questions/80392/never-spell-a-word-the-same-way-twice
// http://rickconner.net/spamweb/tricks.html#misspelling
// https://github.com/dariusk/NaNoGenMo/issues/2
var respell = function(phrase) {

  var redone = phrase;

  var words = new pos.Lexer().lex(phrase);
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var isAlpha = /^[a-z]+/i.test(words[i]);
    var wrod = '';

    // overall chance of mis-spelling
    if (isAlpha && coinflip(.2)) {

      var found = spells[word.toLowerCase()];

      // pick a strategy
      // if found, use the mis-spelling in most cases
      if (found && coinflip(.75)) {
        wrod = pick(spells[word.toLowerCase()]);
        if (isFirstLetterUpperCase(word)) {
          wrod = capitalizeWord(wrod);
        }
      } else if (coinflip()) {
        for (var l = 0; l < word.length; l++) {
          if (isVowell(word[l]) && coinflip(0.3)) {
            // how crazy do we want to be ... more than 3 vowells?
            wrod += word[l] + word[l];
            if (coinflip(0.2)) wrod += word[l];
          } else {
            wrod += word[l];
          }
        }
        console.log('doubler: ' + wrod);
      } else {
        // 4-letter+ words ("in" and "and" are too annoying mixed up)
        if (word.length > 3) {
          // don't use the first char (too oCnfusing)
          // one less than last char, since we do n+1
          var pos1 = getRandom(word.length - 2) + 1;
          wrod = word.substr(0, pos1) + word[pos1+1] + word[pos1] + word.substr(pos1+2);
        } else {
          wrod = word;
        }
      }
      logger(word + ' : ' + wrod);
      // this is crap, if the same word occurs more than once
      // also unsure how to skip some things. AWKWARD.
      redone = redone.replace(new RegExp('\\b' + word + '\\b'), wrod);
    }
  }

  return redone;

};

var tagit = function(status) {

  var tags = [
    'newsforgoats',
    'goat',
    'goats',
    'wildgoat',
    'domesticgoat',
    'capraaegagrushircus',
    'magnificentgoat',
    'hirsutewonder',
    'caprinae',
    'billygoat',
    'modernIbex',
    'smalllivestockanimal',
    'dungproducer',
    'zodiacbeast',
    'zodiacanimal',
    'beardedanimal',
    'beardedbeast',
    'noblebeast',
    'mohair',
    'mohairprovider',
    'mountaindweller'
  ];

  var appendTag = ' #' + pickRemove(tags);
  var notAssigned = true;
  // while ((status + appendTag).length > 140) {
  while (true) {
    if ((status + appendTag).length <= 140) {
      status += appendTag;
      break;
    }
    appendTag = ' #' + pickRemove(tags);
    if (appendTag.indexOf('undefined') > -1) break;
  }

  return status;

};

// ### Screen Scraping

// We pass this function a category code (see `tweet` below). We grab the Google News
// topics page for that category and load the html into `cheerio`. We parse the page for
// text from the links in the left-hand bar, which becomes a list of topics.
// For example, if we passed it 'e' for Entertainment, we might get: Miley Cyrus, Oscars,
// Kanye West, and so on.
function getTopics(category) {
  var topics = [];
  var dfd = new _.Deferred();
  var url = baseUrl + '/news/section?ned=us&topic=' + category;
  logger('url: ' + url);
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(body);
      $('.esc-topic-link').each(function() {
        var topic = {};
        // clean up name: ' Kaspersky Lab »\r\n'
        var nbspre = '/(\xC2\xA0/|&nbsp;)';
        var rdaqre = /\xBB/g; // remove right-double-angled-quote
        topic.name = this.text().replace(nbspre, '').replace('/r/n', '').replace(rdaqre, '').trim();
        topic.url = baseUrl + this.attr('href');
        topics.push(topic);
      });
      dfd.resolve(topics);
    }
    else {
      dfd.reject();
    }
  });
  // The function returns a promise, and the promise resolves to the array of topics.
  return dfd.promise();
}

// We pass this function a URL for a specific topic (for example:
// [Miley Cyrus](https://news.google.com/news/section?pz=1&cf=all&ned=us&hl=en&q=Miley%20Cyrus).
// We then get the page, feed the HTML to `cheerio`, and then pick a random headline
// from the page.
function getHeadline(url) {
  var dfd = new _.Deferred();
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var $ = cheerio.load(body);
      var headlines = $('.titletext');
      // `pick()` doesn't work here because `headlines` isn't an array, so instead we use `cheerio`'s `eq` which
      // give us a matched element at a given index, and pass it a random number.
      var headline = headlines.eq(Math.floor(Math.random()*headlines.length)).text();
      dfd.resolve(headline);
    }
    else {
      dfd.reject();
    }
  });
  return dfd.promise();
}

// ### Tweeting

//      Category codes:
//      w:  world
//      n:  region
//      b:  business
//      tc: technology
//      e:  entertainment
//      s:  sports

// TODO: replace these original notes with ones that make more sense
// This is the core function that is called on a timer that initiates the @twoheadlines algorithm.
// First, we get our list of topics from the Google News sidebar.
// Then we pick-and-remove a random topic from that list.
// Next we grab a random headline available for that topic.
// If the topic itself is in the headline itself, we replace it with a new topic. (For example,
// if `topic.name` is "Miley Cyrus" and `headline` is "Miley Cyrus Wins a Grammy", then we
// get a topic from a different category of news and fill in the blank for "______ Wins a Grammy".)
// If we're unable to find a headline where we can easily find/replace, we simply try again.
function tweet() {
  var categoryCodes = ['w', 'n', 'b', 'tc', 'e', 's'];
  getTopics(pickRemove(categoryCodes)).then(function(topics) {
    var topic = pickRemove(topics);
    logger('topic:');
    logger(topic);

    getHeadline(topic.url).then(function(headline) {
      logger('headline: ' + headline);

      try {
        // for goats, only need one headline
        var nouns = getNounArray(headline);
        // if no nouns, skip
        // this means we skip a tweet
        // look at the BoingBoingHuffr architecture for promises, etc.
        if (nouns.length > 0) {
          var noun = pickRemove(nouns);
          var goat = getGoatWord();

          logger('noun: ' + noun);
          logger('goat: ' + goat);

          if (isFirstLetterUpperCase(noun)){
            goat = capitalize(goat);
            logger('Goat: ' + goat);
          }

          var goatHeadline = headline.replace(noun, goat);

          console.log('old: ' + headline);
          logger('spelled: ' + goatHeadline);

          goatHeadline = respell(goatHeadline);

          goatHeadline = tagit(goatHeadline);

          console.log('new: ' + goatHeadline);

          if (config.tweet_on) {
            T.post('statuses/update', { status: goatHeadline }, function(err, reply) {
              if (err) {
                console.log('error:', err);
              }
              else {
                logger('tweet success');
              }
            });
          }
        }
      } catch(ex) {
        console.log(ex);
      }

    });
  });
}

// Tweets once on initialization.
tweet();


// Tweets every n minutes
// set config.seconds to 60 for a complete minute
setInterval(function () {
  try {
    tweet();
  }
  catch (ex) {
    console.log(ex);
  }
}, 1000 * config.minutes * config.seconds);
