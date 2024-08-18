const supertest = require('supertest');
const requester = supertest('http://localhost:8080');

const jwt = require('jsonwebtoken');
const existingProductId = '663012321c9a8b0af0ed0c1f';

before(async () => {

});

beforeEach(async () => {
})
after(async () => {
});

describe('Test integración', function () {
    this.timeout(20000); 

    describe('Test de flujo de usuario', function () {
        before(async function() {
            const chai = await import('chai');
            global.expect = chai.expect;
        });

        describe('User API', () => {
            let token, cartId;

            it('should register a new user and login with the same user', async function() {
                this.timeout(20000); 

                const userData = {
                    email: 'testuser@example.com',
                    password: 'password',
                    first_name: 'Test',
                    last_name: 'User'
                };

                
                const registerResponse = await requester.post('/api/sessions/register').send(userData);

                expect(registerResponse.status).to.equal(302); 
                expect(registerResponse.headers.location).to.equal('/login');

                
                const loginResponse = await requester.post('/api/sessions/login').send({
                    email: userData.email,
                    password: userData.password
                });

                expect(loginResponse.status).to.equal(302); 
                expect(loginResponse.headers.location).to.equal('/products');

                token = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1]; 

                
                const decodedToken = jwt.decode(token);
                cartId = decodedToken.cart;

                console.log('Cart ID:', cartId);
                console.log('Token:', token);
            });

            describe('Cart API', () => {
                it('should add a product to the cart', async function() {
                    this.timeout(20000); 


                    const response = await requester
                        .post(`/api/cart/${cartId}/products/${existingProductId}`)
                        .set('Cookie', `access_token=${token}`) 
                        .send({ quantity: 2 });

                    expect(response.status).to.equal(200);
                    expect(response.body).to.have.property('status', 'success');
                    expect(response.body).to.have.property('message', 'Product has been added successfully');

                    console.log('Response:', response.body);
                });
            });
        });
    });
});