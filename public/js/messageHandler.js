$(document).ready(function() {

    $(document).on('showMessage', function(event, type, message) {
        if (type === 'success') {

            alert(message); 
        } else if (type === 'error') {

            alert(message);
        }
    });
});