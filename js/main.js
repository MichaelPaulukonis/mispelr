// TODO: connect the button to do stuff

$('#respell').click(function() {

    var text = $('#target').text();

    // alert(text);

    var rtext = respell(text);

    $('#respelled').text(rtext);


});
