// server/types.ts
import 'express-session';

// Extend the session data with user information
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }
}