import passport from 'passport';
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
import User from '../models/User.model';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
      },
      async (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          const email = profile?.emails?.[0]?.value;
          if (!email) return done(null, false);
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({ email, name: profile.displayName, isEmailVerified: true });
          }
          done(null, user);
        } catch (err) {
          done(err as any);
        }
      },
    ),
  );
}

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
