// TODO: hey, make this into an object SVP
// why?
// well, name-space hygeine, for one

var spelltype = {
    random: 'random',
    maledict: 'maledict',
    awfowell: 'awfowell',
    constonantSorrow: 'constonantSorrow',
    maxmister: 'maxmister',
    homophilia: 'homophilia'
};

var config = {
    log: true,
    type: spelltype.random
};


var logger = function(msg, priority) {
    if (config.log || priority) console.log(msg);
};

var pick = function(arr) {
    return arr[Math.floor(Math.random()*arr.length)];
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



// TODO: we should _match_ capitalization
// if all caps, all-caps it!
var isFirstLetterUpperCase = function(str) {
    return (str.charAt(0).toUpperCase() == str.charAt(0));
};


var capitalizeWord = function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
};

var isVowell = function(letter) {
    return /^[aeiou]/i.test(letter);
};

// "maledict" is the name of the dictionary-object
var maledictor = function(word) {
    var wrod = word;
    logger('MALEDICT');
    var found = maledict[word.toLowerCase()];
    if (found) {
        wrod = pick(found);
        if (isFirstLetterUpperCase(word)) {
            wrod = capitalizeWord(wrod);
        }
    }
    return wrod;
};

var homophilia = function(word) {
    var wrod = word;
    logger('HOMOPHILIA');
    var found = homophones[word.toLowerCase()];
    if (found) {
        wrod = pick(found);
        if (isFirstLetterUpperCase(word)) {
            wrod = capitalizeWord(wrod);
        }
    }
    return wrod;
};


var awfowell = function(word) {
    var wrod = '';
    for (var l = 0; l < word.length; l++) {
        if (isVowell(word[l]) && coinflip(0.3)) {
            // how crazy do we want to be ... more than 3 vowells?
            wrod += word[l] + word[l];
            if (coinflip(0.2)) wrod += word[l];
        } else {
            wrod += word[l];
        }
    }
    logger('AWFOWELL');
    return wrod;
};

var constonantsorrow = function(word) {
    var wrod = '';
    for (var l = 0; l < word.length; l++) {
        if (!isVowell(word[l]) && coinflip(0.3)) {
            // how crazy do we want to be ... more than 3 consonants?
            wrod += word[l] + word[l];
            if (coinflip(0.2)) wrod += word[l];
        } else {
            wrod += word[l];
        }
    }
    logger('AWFOWELL');
    return wrod;
};

var maxmister = function(word) {
    var wrod = word;
    logger('MAXMISTER');
    if (word.length > 2) { // must be at least length 3
        // don't use the first char (too oCnfusing)
        // one less than last char, since we do n+1
        var pos1 = getRandom(word.length - 2) + 1;
        wrod = word.substr(0, pos1) + word[pos1+1] + word[pos1] + word.substr(pos1+2);
    }
    return wrod;
};

var isAlpha = function(text) {

    return /^[a-z]+/i.test(text);

};

var randomRespell = function(word) {

    // var isAlpha = /^[a-z]+/i.test(word);
    var wrod = word;

    // overall chance of mis-spelling
    // if (isAlpha && coinflip(.2)) {
    if (isAlpha(word)) {
        var found = maledict[word.toLowerCase()];

        // pick a strategy
        // if found, use the mis-spelling in most cases
        if (found && coinflip(.75)) {
            wrod = maledictor(word);
        } else if (coinflip()) {
            wrod = awfowell(word);
        } else if (coinflip()) {
            wrod = constonantsorrow(word);
        } else if (coinflip()) {
            wrod = homophilia(word);
        } else {
            // 4-letter+ words ("in" and "and" are too annoying mixed up)
            if (word.length > 3) {
                wrod = maxmister(word);
            } else {
                logger('NOTHING');
                wrod = word;
            }
        }
    }

    return wrod;

};

var getTextArray = function(text) {

    var words = [];
    if (typeof Lexer !== 'undefined') {
        // TODO: fails for David23 is in da hizzouse!
        // since it will lex into [ "David", "23", "is", "in", "da", "hizzouse", "!" ]
        // and current replacement strategy will fail on, say, "Davidd" into "David23" in the source
        words = new Lexer().lex(text);
    } else {
        words = phrase.split(/\W+/);
    }

    return words;

};

// creative respellings
// http://security.stackexchange.com/questions/80392/never-spell-a-word-the-same-way-twice
// http://rickconner.net/spamweb/tricks.html#misspelling
// https://github.com/dariusk/NaNoGenMo/issues/2
var respell = function(phrase, method) {

    method = method || spelltype.random;

    var redone = phrase;

    var words = getTextArray(phrase);

    logger(words);

    for (var i = 0; i < words.length; i++) {
        var word = words[i];

        var wrod = '';

        switch (method) {
        case spelltype.maledict:
            wrod = maledictor(word);
            break;
        case spelltype.awfowell:
            wrod = awfowell(word);
            break;
        case spelltype.constonantSorrow:
            wrod = constonantsorrow(word);
            break;
        case spelltype.maxmister:
            wrod = maxmister(word);
            break;
        case spelltype.homophilia:
            wrod = homophilia(word);
            break;
        default:
            wrod = randomRespell(word);
            break;
        }

        if (isAlpha(word)) {
            logger('replacing "' + word + '" with "' + wrod + '"');
            // this is crap, if the same word occurs more than once
            // also unsure how to skip some things. AWKWARD.
            try {
            redone = redone.replace(new RegExp('\\b' + word + '\\b'), wrod);
            } catch(ex) {
                console.log(ex);
                debugger;
            }
        }
    }

    return redone;

};
