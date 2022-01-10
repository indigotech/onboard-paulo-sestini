import * as request from 'supertest';
import { startServer } from '../src/setup';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import { queryCreateUser } from './queries';
import { User } from '../src/entity/user';
import * as bcrypt from 'bcrypt';

before(async () => {
  dotenv.config({ path: __dirname + '/../test.env' });
  await startServer();
  const userRepository = User.getRepository();
  userRepository.clear();
});

after(() => {
  const userRepository = User.getRepository();
  userRepository.clear();
});

describe('Access the server', () => {
  it('Query hello', async () => {
    const response = await request('localhost:4000').post('/').send({
      query: '{ hello }',
    });

    expect(response.body.data.hello).to.be.eq('Hello, world!');
  });
});

describe('Mutation createUser', () => {
  it('Run mutation createUser', async () => {
    const response = await request('localhost:4000').post('/').send(queryCreateUser);

    expect(response.body.data.createUser).to.have.property('id').not.undefined;
    expect(response.body.data.createUser).to.have.property('name');
    expect(response.body.data.createUser).to.have.property('email');
    expect(response.body.data.createUser).to.have.property('birthDate');
  });

  it('Check user on database', async () => {
    const userRepository = User.getRepository();
    const userEmail = queryCreateUser.variables.data.email;
    const user = await userRepository.findOne({ email: userEmail });

    expect(user).to.not.be.undefined;
    expect(user).to.have.property('id').not.undefined;
    expect(user).to.have.property('name');
    expect(user).to.have.property('email');
    expect(user).to.have.property('birthDate');
  });

  it('Check hashed password', async () => {
    const userRepository = User.getRepository();
    const user = await userRepository.findOne({ email: queryCreateUser.variables.data.email });

    const plainPassword = queryCreateUser.variables.data.password;
    expect(await bcrypt.compare(plainPassword, user.password)).to.be.true;
  });
});
