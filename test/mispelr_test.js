var expect = chai.expect;

describe("isAlpha", function() {
    it("should correctly recognize all-alpha strings", function() {
        var text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var value = isAlpha(text);
        expect(value).to.equal(true);
    });

    it("should fail on numerics", function() {
        var text = "12345";
        var value = isAlpha(text);
        expect(value).to.equal(false);
    });

    it("should socceed on mixed-scenarios ('David23')", function() {
        var text = "David23";
        var value = isAlpha(text);
        expect(value).to.equal(true);
    });
});


describe("textArray tests with 'David23 is in da hizzouse! ", function() {

    it("getTextArray() method should exist", function() {
        expect(typeof(getTextArray)).to.equal('function');
    });

    // wait, why the above, and nesting???
    // if the method doesn't exist, the below test setup will fail
    // and cause the entire test to be ignored. OUCH
    // there must be a better way to test such things
    // (oh, why do I want to? because of refactoring....)
    describe("since it exists....", function() {

        var getTokenTestData = function(text) {
            return  {
                text: text,
                tokens: getTextArray(text)
            };
        };

        var data = getTokenTestData("David23 is in da hizzouse!");

        it("should chop up text into 7 tokens", function() {
            expect(data.tokens.length).to.equal(7);
        });

        it("first token in the text is David", function() {
            expect(data.tokens[0]).to.equal("David");
        });

        it("second token in the text is '23'", function() {
            expect(data.tokens[1]).to.equal("23");
        });

        it("'!' is the last token in 'David23 is in da hizzouse!'", function() {
            expect(data.tokens[data.tokens.length-1]).to.equal("!");
        });

    });

});


// well, this is a first stab.
describe("maledictor tests", function() {

    it("maledictor() method should exist", function() {
        expect(typeof(maledictor)).to.equal('function');
    });

    describe("since it exists....", function() {

        var samples = {
            'abbreviate': ['abreviate']
        };

        it("should replace 'abbreviate' with 'abreviate'", function() {
            var ms = maledictor('abbreviate');
            expect(ms).to.equal(samples['abbreviate'][0]);
        });

    });
});
