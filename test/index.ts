import * as request from 'supertest';
import { startServer } from '../src/setup';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import { User } from '../src/entity/user';
import * as bcrypt from 'bcrypt';
import { hashPassword } from '../src/hash';
import { verifyJwt } from '../src/token';
import { JwtPayload } from 'jsonwebtoken';

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

describe('Mutation login', () => {
  beforeEach(async () => {
    const userPredefinedData = queryCreateUser.variables.data;
    const user = new User();
    userPredefinedData.password = await hashPassword(userPredefinedData.password);
    user.create(userPredefinedData);
    await User.getRepository().save(user);
  });

  afterEach(async () => {
    const userRepository = User.getRepository();
    await userRepository.clear();
    queryLoginUser.variables.password = defaultUserTestPassword;
    queryLoginUser.variables.email = defaultUserTestEmail;
  });

  it('should login user and return its info and token', async () => {
    const userPredefinedData = queryCreateUser.variables.data;

    const response = await request('localhost:4000').post('/').send(queryLoginUser);
    const responseUserInfo = response.body.data.login.user;
    const user = await User.getRepository().findOne({ email: userPredefinedData.email });
    const decodedToken = verifyJwt(response.body.data.login.token);
    const tokenPayload = decodedToken as JwtPayload;

    expect(responseUserInfo.id).to.be.a('number').greaterThan(0);
    expect(responseUserInfo.name).to.be.equal(userPredefinedData.name);
    expect(responseUserInfo.email).to.be.equal(userPredefinedData.email);
    expect(responseUserInfo.birthDate).to.be.equal(userPredefinedData.birthDate);
    expect(tokenPayload.email).to.be.equal(user.email);
  });

  it('should not login if password is wrong', async () => {
    queryLoginUser.variables.password = '8123hjasd897123';

    const response = await request('localhost:4000').post('/').send(queryLoginUser);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Invalid email or password. Please, try again.');
    expect(error.code).to.be.equal(401);
  });

  it("should not login if email doesn't exist", async () => {
    queryLoginUser.variables.email = 'another@email.com';

    const response = await request('localhost:4000').post('/').send(queryLoginUser);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Invalid email or password. Please, try again.');
    expect(error.code).to.be.equal(401);
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

const queryLoginUser = {
  query: `
    mutation loginUser($email: String, $password: String){
      login(email: $email, password: $password){
        user{
          id,
          name,
          email,
          birthDate
        },
        token
      }
    }
  `,
  variables: {
    email: defaultUserTestEmail,
    password: defaultUserTestPassword,
  },
};
