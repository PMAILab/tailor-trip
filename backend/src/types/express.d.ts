import type { AuthUser } from '../lib/supabaseAuth';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
