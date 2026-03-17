import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import jsonwebtoken from 'jsonwebtoken';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('No email found in Google profile'));
        }

        const email = profile.emails[0].value;
        const name = profile.displayName || 'Google User';
        const googleId = profile.id;

        let user = await User.findOne({ email });

        if (user) {
          // If user exists but no googleId is linked, link it.
          if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user via Google
        user = await User.create({
          name,
          email,
          googleId,
          password: 'google_oauth_no_password', // Required by schema if not explicitly handled
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
