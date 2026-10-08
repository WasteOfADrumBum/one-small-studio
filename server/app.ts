import express, { type NextFunction, type Request, type Response } from 'express';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// CSRF: JSON calls that change data must come from this site's own pages.
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!MUTATING.has(req.method)) return next();
  const origin = req.get('origin');
  const host = req.get('x-forwarded-host') ?? req.get('host');
  if (!origin || new URL(origin).host !== host) return res.status(403).send('Forbidden');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'one-small-studio', time: new Date().toISOString() });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});
