import * as jwt from 'jsonwebtoken';
import { User } from './entity/user';

export function generateJwt(user: User, rememberMe: boolean) {
  const expiration = rememberMe ? process.env.JWT_EXPIRATION_REMEMBER_ME : process.env.JWT_EXPIRATION;
  return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: expiration});
}

export function verifyJwt(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
