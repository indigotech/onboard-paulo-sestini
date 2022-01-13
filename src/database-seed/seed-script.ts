import * as faker from '@faker-js/faker';
import { User } from '../entity/user';
import { hashPassword } from '../hash';
import { startDatabase } from '../setup';
import * as dotenv from 'dotenv';
dotenv.config();

async function generateUser() {
  const user = new User();
  user.create({
    name: faker.name.firstName(),
    email: faker.internet.email(),
    birthDate: faker.internet.email(),
    password: await hashPassword(faker.internet.password()),
  });
  return user;
}

export async function populateDatabase(quantity = 50) {
  const userRepository = User.getRepository();
  const users: User[] = [];

  for (let i = 0; i < quantity; i++) {
    const newUser = await generateUser();
    users.push(newUser);
  }
  await userRepository.save(users);
}

async function startSeed() {
  await startDatabase();
  await populateDatabase(50);
}

startSeed();
