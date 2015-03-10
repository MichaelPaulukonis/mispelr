// TODO: connect the button to do stuff

$('#respell').click(function() {

    var text = $('#target').val();

    var method = $('input[name=spelltype]:checked').val();

    console.log(method);

    var rtext = respell(text, method);

    $('#respelled').text(rtext);

    return false;

});
