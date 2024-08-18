const express = require('express');
const session = require('express-session');
const exphbs = require("express-handlebars");
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const mongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUiExpress = require('swagger-ui-express');

const { addLogger, logger } = require('./utils/logger.js'); 
const config = require('./config/config.js');
const websocket = require('../websocket.js');
const cartsRouter = require('./routes/cartsRouter.js');
const productsRouter = require('./routes/productsRouter.js');
const viewsRouter = require('./routes/viewsRouter.js');
const sessionRouter = require('./routes/sessionRouter.js');
const initializatePassport = require('./config/passportConfig.js');
const errorHandler = require('./middlewares/errors/index.js');
const usersRouter = require ('./routes/usersRouter.js');

const app = express();

const PORT = process.env.PORT || 8080;
const mongoUrl = process.env.dbURI;


app.use(session({
    store: mongoStore.create({
        mongoUrl: mongoUrl,
        ttl: 20
    }),
    secret: 'secretPhrase',
    resave: false,
    saveUninitialized: false
}));

// Mongo atlas connect
async function connectToDatabase() {
    try {
        await mongoose.connect(mongoUrl, {
            dbName: 'Productos'
        });
        logger.info('Conexión a MongoDB Atlas establecida.');
    } catch (error) {
        logger.fatal('Error al conectar a MongoDB Atlas:', error); 
    }
}

connectToDatabase();

initializatePassport();
app.use(passport.initialize());
app.use(passport.session());

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación sistema Ecommerce Bruno Fresilli',
            description: 'Esta documentación cubre toda la API habilitada para este Ecommerce',
        },
    },
    apis: ['./src/docs/cart/cart.yaml', './src/docs/product/product.yaml'], 
};
const specs = swaggerJsdoc(swaggerOptions);

app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// Handlebars
const hbs = exphbs.create();
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname,  'views'));

// Middlewares

app.use(addLogger); 
app.use(express.urlencoded({ extended: true })); // Para procesar application/x-www-form-urlencoded
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Routerss
app.use('/api/sessions', sessionRouter); 
app.use('/api/products', productsRouter);
app.use('/api/cart', cartsRouter);
app.use('/api/users', usersRouter);
app.use('/', viewsRouter); 
app.use(errorHandler);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

const httpServer = app.listen(PORT , () => {
    logger.info(`Servidor escuchando en el puerto ${PORT }`);
});

const io = new Server(httpServer);

websocket(io, httpServer);
