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
                // We pass the profile to the controller or just return it here.
                // Since we want to handle user creation in the controller (to access role from state),
                // we just pass the profile details forward.
                // However, passport usually expects a user object.
                // We can return the profile object as "user" here and handle logic in controller,
                // OR we can do logic here if we can access the state.
                // With passReqToCallback: true, we have req.query.state!

                // Returning profile, so controller can handle the JWT generation and final response
                return done(null, profile);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialization is required for sessions, but we are using JWT. 
// However, passport might still ask for it if we don't disable sessions in the route.
// We will use { session: false } in the route, so this might not be needed.
// But it's good practice to have simple serialization just in case.
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
