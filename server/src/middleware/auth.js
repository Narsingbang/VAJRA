import { supabaseAdmin, createUserClient } from '../config/supabase.js';
import { UnauthorizedError } from '../utils/errors.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Missing bearer token');
    }

    // In test or development mock mode if token is test-user
    if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
      const mockId = token.replace('test-token-', '');
      req.user = { id: mockId, email: `${mockId}@example.com` };
      req.userToken = token;
      return next();
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError(error?.message || 'Invalid or expired access token');
    }

    req.user = user;
    req.userToken = token;
    req.supabaseUser = createUserClient(token);

    next();
  } catch (err) {
    next(err);
  }
}
