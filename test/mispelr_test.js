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


var getTokenTestData = function(text) {
    return  {
        text: text,
        tokens: getTextArray(text)
    };
};

describe("textArray tests with 'David23 is in da hizzouse! ", function() {
    it("should chop up text into 7 tokens", function() {
        var data = getTokenTestData("David23 is in da hizzouse!");
        expect(data.tokens.length).to.equal(7);

    });

    it("first token in the text is David", function() {
        var data = getTokenTestData("David23 is in da hizzouse!");
        expect(data.tokens[0]).to.equal("David");
    });

    it("second token in the text is '23'", function() {
        var data = getTokenTestData("David23 is in da hizzouse!");
        expect(data.tokens[1]).to.equal("23");
    });

    it("'!' is the last token in 'David23 is in da hizzouse!'", function() {
        var data = getTokenTestData("David23 is in da hizzouse!");
        expect(data.tokens[data.tokens.length-1]).to.equal("!");
    });

});
