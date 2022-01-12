import { CustomError } from './error-handling';
import { verifyJwt } from './token';
import { User } from './entity/user';
import { JwtPayload } from 'jsonwebtoken';

export function authenticateUser({ req }) {
  const token = req.headers.authorization || '';

  if (token) {
    const user = getUser(token);
    return { user };
  }
}

async function getUser(token) {
  try {
    const decodedToken = verifyJwt(token);
    const tokenPayload = decodedToken as JwtPayload;

    const userRepository = User.getRepository();

    const user = userRepository.findOne({ email: tokenPayload.email });

    return user;
  } catch (e) {
    throw new CustomError('Authentication failed.', 401);
  }
}
