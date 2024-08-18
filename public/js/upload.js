$(document).ready(function() {
    
    $(document).on('showMessage', function(event, type, message) {
        if (type === 'success') {
            alert(message); 
        } else if (type === 'error') {
            alert(message); 
        }
    });

    $('#uploadForm').on('submit', function(event) {
        event.preventDefault(); 

        
        var formData = new FormData(this);

       
        var userId = $('#uploadForm').data('userId'); 
        var url = `/api/users/${userId}/documents`;

       
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false, 
            contentType: false, 
            success: function(response) {
                
                $(document).trigger('showMessage', ['success', 'Archivos subidos exitosamente!']);
            },
            error: function(xhr, status, error) {
               
                let errorMessage = 'Error al subir los archivos';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                $(document).trigger('showMessage', ['error', errorMessage]);
            }
        });
    });
});