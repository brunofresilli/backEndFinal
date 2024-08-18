document.addEventListener('DOMContentLoaded', () => {
    console.log(`comienza el script`);
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);

       
        const urlSearchParams = new URLSearchParams();
        formData.forEach((value, key) => {
            urlSearchParams.append(key, value);
        });

       
        for (const [key, value] of urlSearchParams.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            const response = await fetch('/api/products/productos', {
                method: 'POST',
                body: urlSearchParams,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.ok) {
               
                alert('Producto guardado con éxito');
            } else {
                const errorText = await response.text();
                alert('Error al cargar el producto: ' + errorText);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Error al enviar los datos al servidor');
        }
    });
});

document.getElementById('productForm').addEventListener('submit', async function(event) {
    event.preventDefault(); 

     

    const productData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: parseFloat(document.getElementById('price').value),
        status: document.getElementById('status').value,
        stock: parseInt(document.getElementById('stock').value, 10),
        category: document.getElementById('category').value,
    };

    try {
        const response = await fetch('/api/products/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',

            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (data.status === 'success') {
            alert('Producto guardado con éxito');
            
        } else {
            alert(`Error al cargar el producto: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el producto');
    }
});