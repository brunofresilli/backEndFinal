class ProductDTO {
    constructor({ id, title, description, code, price, status, stock, category, thumbnails }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.code = code;
        this.price = price;
        this.status = status;
        this.stock = stock;
        this.category = category;
        this.thumbnails = thumbnails;
    }
}

module.exports = ProductDTO;
