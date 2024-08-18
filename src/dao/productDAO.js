const { productModel } = require('./models/product.js');

class ProductDAO {
    async findAll() {
        return await productModel.find().lean();
    }

    async findById(id) {
        return await productModel.findById(id).lean();
    }

    async findByCode(code) {
        return await productModel.findOne({ code }).lean();
    }

    async create(productData) {
        return productModel.create(productData)
    }

    async update(id, updatedProductData) {
        return await productModel.updateOne({ _id: id }, updatedProductData);
    }

    async delete(id) {
        await productModel.deleteOne(id);
        return true;
    }
}

module.exports = new ProductDAO();
