import * as jwt from 'jsonwebtoken';
import { User } from './entity/user';

export function generateJwt(user: User) {
  return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
