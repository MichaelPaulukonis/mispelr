// each line should be expressed combinatorically
// eg
// accept and except := 'accept': ['except'], 'except': ['accept']
// aye and eye and I := 'aye': ['eye', 'I'], 'eye': ['aye', 'I'], 'I': ['aye', 'eye']

// see pairwise combinations @ http://stackoverflow.com/a/14007148/41153

// 'bald','balled','bawled' :=
// [ [[bald, balled], [bald, bawled]], [[balled, bald],[balled,[bawled]], [[bawled,bald],[bawled,balled]] ]
// so THIS has to be reprocessed....
var pairwise = function(arr) {
  return arr.map(function(item, index, originalArray) {
    var tmp = originalArray.map(function(_item) {
      if (item != _item) {
        return [item, _item];
      }
    });
    tmp.splice(tmp.indexOf(undefined), 1); // because there is now one undefined index we must remove it.
    return tmp;
  });
};

var objectFromPairs = function(parr) {

  var o = {};

  for (var i = 0; i < parr.length; i++) {
    var t = parr[i];
    var k = t[0][0];
    console.log(t, k);
    o[k] = [];
    for (var j = 0; j < t.length; j++) {
      o[k].push(t[j][1]);
    }
  }

  return o;

};

var convert = function(file, output) {

  var fs = require('fs');

  fs.readFile(file, 'utf8', function(err, data) {

    if (err) {
      return console.log(err);
    }

    var hphones = {};
    var lines = data.trim().split('\n');
    lines.forEach(function(line) {
      if (line.indexOf('#') === 0) return;
      var words = line.trim().split(',');
      var pairs = objectFromPairs(pairwise(words));
      for (var key in pairs) {
        hphones[key] = pairs[key];
      }
    });

    fs.writeFile(output, JSON.stringify(hphones));
    return console.log(output);

  });

};


// TODO: use the inputName as part of the output....
var defaultOutputName = function(inputName) {

  return 'homophilia.' + (Math.random() * 0x1000000000).toString(36) + '.js';

};


// var file = 'c:/FormFileDataMine/Reports/after.01.txt';

var program = require('commander');

program
  .version('0.0.1')
  .option('-i, --input [file]', 'input [file]', 'homophone.master.list')
  .option('-o, --output [file]', 'output file', defaultOutputName())
  .parse(process.argv);


convert(program.input, program.output);
