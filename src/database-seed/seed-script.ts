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

async function populateDatabase(quantity = 50) {
  await startDatabase();
  const userRepository = User.getRepository();

  for (let i = 0; i < quantity; i++) {
    const newUser = await generateUser();
    await userRepository.save(newUser);
  }
}

populateDatabase(50);
