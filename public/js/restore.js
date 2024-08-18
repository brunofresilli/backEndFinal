

$(document).ready(function() {

    $('#resetEmailForm').submit(function(event) {
        event.preventDefault();
        const email = $('#email').val();

        $.ajax({
            url: '/api/sessions/restore',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email }),
            success: function(response) {
                console.log('Success:', response);
                $(document).trigger('showMessage', ['success', response.message]);
               
            },
            error: function(xhr) {
                const errorResponse = xhr.responseJSON;
                console.log('Error:', errorResponse);
                $(document).trigger('showMessage', ['error', errorResponse.message]);
            
            }
        });
    });

    $('#resetPasswordForm').submit(function(event) {
        event.preventDefault();
        const accessToken = $('input[name="access_token"]').val();
        const newPassword = $('#password').val();

        console.log('Access Token:', accessToken)

        $.ajax({
            url: '/api/sessions/restoreConfirm',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                access_token: accessToken,
                password: newPassword
            }),
            success: function(response) {
                console.log('Success:', response);
                $(document).trigger('showMessage', ['success', response.message]);
            
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000); 
            },
            
            error: function(xhr) {
                const errorResponse = xhr.responseJSON;
                console.log('Error:', errorResponse);
                $(document).trigger('showMessage', ['error', errorResponse.message]);
        
            }
        });
    });
});                                              
