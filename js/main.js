// TODO: connect the button to do stuff


var defaults = {
    output: '[respelled text goes here]',
    input: 'ReSpeller mangles your text in a variety of configurable ways.\nEdit this text and try it out!'
};

var reset = function(input, output) {

    $('#respelled').text(output);
    $('#target').val(input);
};

reset(defaults.input, defaults.output);

$('#respell').click(function() {

    var text = $('#target').val().trim();

    if (text.length > 0) {

        var method = $('input[name=spelltype]:checked').val();

        console.log(method);

        var rtext = respell(text, method);

        $('#respelled').text(rtext);

    }

    return false;

});


$('#clear').on("click", function() {

    reset('', defaults.output);

});
