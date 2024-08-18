const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');


const logLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warning: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue'
    }
};


const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});


const developmentLogger = createLogger({
    levels: logLevels.levels,
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console({ level: 'debug' }),
    ]
});


const productionLogger = createLogger({
    levels: logLevels.levels,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new transports.Console({ level: 'info' }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'errors.log'), level: 'error' }),
    ]
});


const isProduction = false; 


const logger = isProduction ? productionLogger : developmentLogger;


require('winston').addColors(logLevels.colors);


const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.warning(`${new Date().toDateString()} ${req.method} ${req.url}`);
    next();
};

module.exports = {
    addLogger,
    logger
};
