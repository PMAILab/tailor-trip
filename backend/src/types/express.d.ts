import type { AuthUser } from '../lib/supabaseAuth.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
