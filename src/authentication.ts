import { CustomError } from './error-handling';
import { verifyJwt } from './token';
import { JwtPayload } from 'jsonwebtoken';

export function getAuthenticatedUserId({ req }) {
  const token = req.headers.authorization || '';

  if (token) {
    const userId = getUserId(token);
    return { userId };
  }
}

async function getUserId(token: string) {
  try {
    const decodedToken = verifyJwt(token);
    const tokenPayload = decodedToken as JwtPayload;

    return tokenPayload.userId;
  } catch (e) {
    throw new CustomError('Authentication failed.', 401, 'Invalid JWT token.');
  }
}
