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

// TODO: break down into sub-expectations
// since David and 23 should be joined up, IMHO
describe("textArray", function() {
    it("should chop up 'David23 is in da hizzouse!' the way we expect", function() {
        var text = "David23 is in da hizzouse!";
        var words = getTextArray(text);
        expect(words.length).to.equal(7);
        expect(words[0]).to.equal("David");
        expect(words[1]).to.equal("23");
        expect(words[6]).to.equal("!");
    });

});
