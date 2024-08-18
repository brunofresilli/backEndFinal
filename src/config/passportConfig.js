const passport = require('passport');
const GitHubStrategy = require('passport-github2');
const local = require('passport-local');
const userModel = require('../dao/models/user.js');
const  { createHash, isValidPassword }  = require ('../utils/functionsUtils.js')
const { ExtractJwt } = require ('passport-jwt');
const jwt = require ('passport-jwt');
require('dotenv').config()

const localStratergy = local.Strategy;
const initializePassport = () => {
   

    passport.use('register', new localStratergy(
        {
            passReqToCallback: true,
            usernameField: 'email'
        },
        async (req, username, password, done) => {
            const { first_name, last_name, email} = req.body;

            try {
                let user = await userModel.findOne({ email: username}).lean();
                if (user) {
                    console.log("User already exist!");
                    return done(null, false);
                }

                const newUser = { first_name, last_name, email, password: createHash(password)}
                const result = await userModel.create(newUser);

                return done(null, result);
            } catch (error) {
                return done(error.message);
            }
        }
    ));
    
    passport.use('login', new  localStratergy(
        {
            usernameField: 'email'
        },
        async (email, password, done) => {
            try {
                console.log('Email:', email);
                const user = await userModel.findOne({ email: email }).lean();
                console.log('User:', user);
                if (!user || !isValidPassword(user, password)) {
                    console.log('Authentication failed');
                    return done(null, false);
                }
                console.log('Authentication successful');
                return done(null, user);
            } catch (error) {
                console.error('Error during authentication:', error);
                return done(error);
            }
        }
    ));
    


    passport.use('github', new GitHubStrategy({
        
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.SECRET_ID,
        callbackURL: process.env.CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile); 
            let user = await userModel.findOne({ emile: profile._json.login });
            if (!user) {
                let newUser = {
                    email: profile._json.login,
                    last_name: '',
                }
                let result = await userModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id);
        done(null, user);
    });
};

const JWTStrategy = jwt.Strategy;

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies.access_token ?? null;
    }
    return token;
  };
  const JWT_SECRET = process.env.JWT_SECRET

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
            if (!jwt_payload.role) {
              throw new Error('Token payload does not contain role');
            }
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );


module.exports = initializePassport;