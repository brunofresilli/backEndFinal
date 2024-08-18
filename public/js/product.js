$(document).ready(function () {
  $(".button-addCart").click(function () {
    console.log("Botón de agregar al carrito clickeado");
   
    const productId = $(this).data("product-id");
    const userId = $(this).data("cart-id");
    console.log(`Cart ID: ${userId}, Product ID: ${productId}`);
    console.log("Botón de agregar al carrito clickeado");
    if (!userId || !productId) {
      console.error('Cart ID o Product ID está indefinido');
      return;
    }
    
    $.ajax({
      type: "POST",
      url: `/api/cart/${userId}/products/${productId}`,
      success: function (response) {
       
        console.log("Product added to cart successfully:", response);
      },
      error: function (xhr, status, error) {
      
        console.error("Error adding product to cart:", error);
      },
    });
  });
});
