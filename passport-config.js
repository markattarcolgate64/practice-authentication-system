const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs');



function initialize(passport){
    //done is that callback thing 
    //Called from login to authenticate user 
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if (user == null){
            return done(null, false, {message: 'No user found with email'});
        }

        try {
            if (await bcrypt.compare(password, user.password)) {

            } else {
                return done(null, false, {message: 'Password incorrect'} );
            }
        } catch (e) {
            return done(e);
        }
    }
    passport.use(new LocalStrategy({usernameField: 'email'}), authenticateUser) ;
    
    passport.serializeUser((user,done) => {});
    passport.deserializeUser((id,done) => {});

}

module.exports = initialize;