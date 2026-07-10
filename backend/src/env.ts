// Must be the very first import in server/index.ts. ES module imports are
// all evaluated before the importing file's own top-level statements run, so
// a `dotenv.config()` call inside index.ts's body — no matter where it's
// textually placed — always runs *after* every other imported module (and
// their module-level `process.env.X` reads) has already executed. Isolating
// the side effect in its own module and importing it first sidesteps that:
// sibling imports within one file still evaluate in written order.
import dotenv from 'dotenv';

dotenv.config();
