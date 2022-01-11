import * as request from 'supertest';
import { startServer } from '../src/setup';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import { User } from '../src/entity/user';
import * as bcrypt from 'bcrypt';

before(async () => {
  dotenv.config({ path: __dirname + '/../test.env' });
  await startServer();
  const userRepository = User.getRepository();
  await userRepository.clear();
});

after(async () => {
  const userRepository = User.getRepository();
  await userRepository.clear();
});

describe('Access the server', () => {
  it('should return hello world', async () => {
    const response = await request('localhost:4000').post('/').send({
      query: '{ hello }',
    });

    expect(response.body.data.hello).to.be.eq('Hello, world!');
  });
});

describe('Mutation createUser', () => {
  afterEach(async () => {
    const userRepository = User.getRepository();
    await userRepository.clear();
  });

  it('should create user on database and return its info', async () => {
    const response = await request('localhost:4000').post('/').send(queryCreateUser);

    const userPredefinedData = queryCreateUser.variables.data;
    const responseUserInfo = response.body.data.createUser;

    expect(responseUserInfo.id).to.be.a('number').greaterThan(0);
    expect(responseUserInfo.name).to.be.equal(userPredefinedData.name);
    expect(responseUserInfo.email).to.be.equal(userPredefinedData.email);
    expect(responseUserInfo.birthDate).to.be.equal(userPredefinedData.birthDate);

    const userRepository = User.getRepository();
    const user = await userRepository.findOne({ email: userPredefinedData.email });

    expect(user.id).to.be.equal(responseUserInfo.id);
    expect(user.name).to.be.equal(userPredefinedData.name);
    expect(user.email).to.be.equal(userPredefinedData.email);
    expect(user.birthDate).to.be.equal(userPredefinedData.birthDate);
  });

  it('should hash password', async () => {
    await request('localhost:4000').post('/').send(queryCreateUser);

    const userPredefinedData = queryCreateUser.variables.data;

    const userRepository = User.getRepository();
    const user = await userRepository.findOne({ email: userPredefinedData.email });

    const plainPassword = userPredefinedData.password;
    expect(await bcrypt.compare(plainPassword, user.password)).to.be.true;
  });

  it('should give an error if email is duplicated', async () => {
    const userPredefinedData = queryCreateUser.variables.data;

    const user = new User();
    user.create(userPredefinedData);
    await User.getRepository().save(user);

    const response = await request('localhost:4000').post('/').send(queryCreateUser);
    const message = response.body.errors[0].message;

    expect(message).to.be.equal('Email is already in use.');

    const userRepository = User.getRepository();
    const users = await userRepository.find({ email: userPredefinedData.email });

    expect(users.length).to.be.equal(1);
  });

  it('should not let password less than 6 characters long', async () => {
    queryCreateUser.variables.data.password = 'abc';
    const response = await request('localhost:4000').post('/').send(queryCreateUser);
    const errorMessage = response.body.errors[0].message;
    expect(errorMessage).to.be.equal('Password is too short, needs at least 6 characters.');
  });

  it('should not let password without at least 1 digit', async () => {
    queryCreateUser.variables.data.password = 'abcdef';
    const response = await request('localhost:4000').post('/').send(queryCreateUser);
    const errorMessage = response.body.errors[0].message;
    expect(errorMessage).to.be.equal('Password needs at least 1 digit.');
  });

  it('should not let password without at least 1 letter', async () => {
    queryCreateUser.variables.data.password = '123456';
    const response = await request('localhost:4000').post('/').send(queryCreateUser);
    const errorMessage = response.body.errors[0].message;
    expect(errorMessage).to.be.equal('Password needs at least 1 letter.');
  });
});

const queryCreateUser = {
  query: `
      mutation createUserMutation($data: UserInput){
        createUser(data: $data){
          id,
          name,
          email,
          birthDate
        }
      }`,
  variables: {
    data: {
      name: 'Paulo Otavio',
      email: 'paulo@otavio.com',
      password: 'abc123',
      birthDate: '01-01-2001',
    },
  },
};
