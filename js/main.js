// TODO: connect the button to do stuff

$('#respell').click(function() {

    var text = $('#target').text();

    var values = {};
    $("input:checked").each(function () {
        values[$(this).val()] = true;
    });

    console.log(values);

    var rtext = respell(text);

    $('#respelled').text(rtext);


});
