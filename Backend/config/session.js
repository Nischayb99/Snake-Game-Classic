import session from 'express-session';

export const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your_secret_key_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
    name: 'snake-game-session'
};

export const setupSession = (app) => {
    app.use(session(sessionConfig));
};