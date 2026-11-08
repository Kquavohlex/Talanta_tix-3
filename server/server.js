import express from 'express'; import helmet from 'helmet'; import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit'; import path from 'path'; import fs from 'fs';
import auth from './routes/auth.js'; import pub from './routes/public.js'; import admin from './routes/admin.js';
for (const k of ['DATABASE_URL','JWT_SECRET','ADMIN_JWT_SECRET']) if (!process.env[k]) { console.error('Missing env', k); process.exit(1); }
const app = express(); app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives(), 'img-src': ["'self'", 'data:', 'https:'] } } }));
app.use(express.json({ limit: '100kb' })); app.use(cookieParser());
const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true });
app.use('/api/auth/login', strict); app.use('/api/auth/register', strict); app.use('/api/admin/login', strict);
app.use('/api/auth', auth); app.use('/api/admin', admin); app.use('/api', pub);
app.get('/healthz', (_q, r) => r.send('ok'));
const dist = path.resolve('client/dist');
if (fs.existsSync(dist)) { app.use(express.static(dist)); app.get('*', (_q, r) => r.sendFile(path.join(dist, 'index.html'))); }
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Server error' }); });
app.listen(process.env.PORT || 3000, () => console.log('TalantaTix API up'));
