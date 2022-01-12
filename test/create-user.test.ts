import * as request from 'supertest';
import { expect } from 'chai';
import { User } from '../src/entity/user';
import * as bcrypt from 'bcrypt';

describe('Mutation createUser', () => {
  afterEach(async () => {
    const userRepository = User.getRepository();
    await userRepository.clear();

    queryCreateUser.variables.data.email = defaultUserTestEmail;
    queryCreateUser.variables.data.password = defaultUserTestPassword;
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
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Password is too short, needs at least 6 characters.');
    expect(error.code).to.be.equal(400);
  });

  it('should not let password without at least 1 digit', async () => {
    queryCreateUser.variables.data.password = 'abcdef';

    const response = await request('localhost:4000').post('/').send(queryCreateUser);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Password needs at least 1 digit.');
    expect(error.code).to.be.equal(400);
  });

  it('should not let password without at least 1 letter', async () => {
    queryCreateUser.variables.data.password = '123456';

    const response = await request('localhost:4000').post('/').send(queryCreateUser);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Password needs at least 1 letter.');
    expect(error.code).to.be.equal(400);
  });
});

const defaultUserTestEmail = 'paulo@otavio.com';
const defaultUserTestPassword = 'abc123';

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
      email: defaultUserTestEmail,
      password: defaultUserTestPassword,
      birthDate: '01-01-2001',
    },
  },
};
