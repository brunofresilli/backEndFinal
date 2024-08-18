const { fakerES } = require ('@faker-js/faker');

 const generateFakeProduct = () => {
    return {
        id_: fakerES.id.database.mongodbObjectId(),
        title: fakerES.commerce.productName(),
        description: fakerES.commerce.productDescription(),
        code: fakerES.string.uuid(),
        price: parseFloat(fakerES.commerce.price()),
        status: fakerES.datatype.boolean(),
        stock: fakerES.number.int({ min: 1, max: 100 }),
        category: fakerES.commerce.department(),
        thumbnails:  fakerES.image.url()

    }
}
module.exports = {generateFakeProduct};