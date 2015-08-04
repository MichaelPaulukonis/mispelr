// lexer.js was adapted from the lexer.js file in pos-js
// https://github.com/dariusk/pos-js
// jspos is licensed under the GNU LGPLv3
// this version was modified for use on the web
// although pos-js was modified for node from the original web-based pos-js
// because the node-based pos-js is actively maintained
// and all that.

var re = {
  number: /[0-9]*\.[0-9]+|[0-9]+/ig,
  space: /\s+/ig,
  unblank: /\S/,
  punctuation: /[\/\.\,\?\!\"\'\:\;\$\(\)\#]/ig
};

function LexerNode(string, regex, regexs){
  this.string = string;
  this.children = [];
  var childElements;

  if (string) {
    this.matches = string.match(regex);
    childElements = string.split(regex);
  }

  if (!this.matches) {
    this.matches = [];
    childElements = [string];
  }

  if (!regexs.length) {
    // no more regular expressions, we're done
    this.children = childElements;
  } else {
    // descend recursively
    var nextRegex = regexs[0]
    , nextRegexes = regexs.slice(1);

    for (var i in childElements) {
      if (childElements.hasOwnProperty(i)) {
        this.children.push(
          new LexerNode(childElements[i], nextRegex, nextRegexes));
      }
    }
  }
}

LexerNode.prototype.fillArray = function(array){
  for (var i in this.children) {
    if (this.children.hasOwnProperty(i)) {
      var child = this.children[i];

      if (child.fillArray) {
        child.fillArray(array);
      } else if (re.unblank.test(child)) {
        array.push(child);
      }

      if (i < this.matches.length) {
        var match = this.matches[i];
        if (re.unblank.test(match))
          array.push(match);
      }
    }
  }
};

LexerNode.prototype.toString = function(){
  var array = [];
  this.fillArray(array);
  return array.toString();
};

function Lexer(){
  // Split by then numbers, then whitespace, then punctuation
  this.regexs = [re.number, re.space, re.punctuation];
};

Lexer.prototype.lex = function(string){
  var array = []
  , node = new LexerNode(string, this.regexs[0], this.regexs.slice(1));
  node.fillArray(array);
  return array;
};
