import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
} from "../constants.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_REDIRECT_URI, // e.g. /api/v1/users/google/callback
            passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {

                return done(null, profile);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
