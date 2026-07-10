import type { NextFunction, Request, Response } from 'express';
import { resolveUser } from '../lib/session';

/** Attaches `req.user` and calls next() for a real, authenticated Supabase
 *  session; 401s otherwise. Mock mode never satisfies this (no tt_at/tt_rt
 *  cookie exists there) — the client only calls DB-backed routes guarded by
 *  this middleware when not in mock mode. */
export async function requireUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req, res);
  if (!user) {
    res.status(401).json({ error: 'Sign in required' });
    return;
  }
  req.user = user;
  next();
}
