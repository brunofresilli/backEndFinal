document.addEventListener("DOMContentLoaded", () => {
    const removeButtons = document.querySelectorAll(".delete-button");
  

    removeButtons.forEach((button) => {
      button.addEventListener("click", async function() {
        console.log("Botón de eliminar del carrito clickeado");
  
    
        const productId = this.dataset.productId;
        const cartId = this.dataset.cartId;
  
 
        if (!productId || !cartId) {
          alert("No se pudo obtener el ID del producto o del carrito.");
          return;
        }
  
        try {
          const response = await fetch(`/api/cart/${cartId}/products/${productId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          if (response.ok) {
            alert("Producto eliminado del carrito con éxito");
            location.reload(); 
          } else {
            const result = await response.json();
            alert(`Error al eliminar el producto del carrito: ${result.message}`);
          }
        } catch (error) {
          console.error("Error al eliminar el producto del carrito:", error);
          alert("Hubo un error al eliminar el producto del carrito.");
        }
      });
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
    
    const purchaseButton = document.querySelector(".purchase-button");
  
    if (purchaseButton) {
      purchaseButton.addEventListener("click", async () => {
        const cartId = purchaseButton.dataset.cartId;
  
        if (!cartId) {
          alert("No se encontró el ID del carrito.");
          return;
        }
  
        try {
          const response = await fetch(`/api/cart/${cartId}/purchase`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.redirected) {
      
            window.location.href = response.url;
          } else if (response.ok) {
            const result = await response.json();
            alert("Compra completada con éxito.");
            console.log("Ticket:", result.ticket);
            console.log("Productos no comprados:", result.productsNotPurchased);
          } else {
            const result = await response.json();
            alert(`Error al completar la compra: ${result.message}`);
          }
        } catch (error) {
          console.error("Error al completar la compra:", error);
          alert("Hubo un error al completar la compra.");
        }
      });
    }
  });