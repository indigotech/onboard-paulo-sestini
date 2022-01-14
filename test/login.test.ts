import * as request from 'supertest';
import { expect } from 'chai';
import { User } from '../src/entity/user';
import { hashPassword } from '../src/hash';
import { generateJwt, verifyJwt } from '../src/token';
import { JwtPayload } from 'jsonwebtoken';
import { clearDatabase } from './utils';

describe('Mutation login', () => {
  beforeEach(async () => {
    const userPredefinedData = queryCreateUser.variables.data;
    const user = new User();
    userPredefinedData.password = await hashPassword(userPredefinedData.password);
    user.create(userPredefinedData);
    await User.getRepository().save(user);
  });

  afterEach(async () => {
    await clearDatabase();
    queryLoginUser.variables.password = defaultUserTestPassword;
    queryLoginUser.variables.email = defaultUserTestEmail;
  });

  it('should login user and return its info and token', async () => {
    const userPredefinedData = queryCreateUser.variables.data;
    const user = await User.getRepository().findOne({ email: userPredefinedData.email });

    const response = await request('localhost:4000').post('/').send(queryLoginUser);
    const responseUserInfo = response.body.data.login.user;
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

  it('should have 2 days expiration token without rememberMe', async () => {
    const userPredefinedData = queryCreateUser.variables.data;
    const user = await User.getRepository().findOne({ email: userPredefinedData.email });

    const token = generateJwt(user, false);
    const decodedToken = verifyJwt(token);
    const tokenPayload = decodedToken as JwtPayload;
    const iat = tokenPayload.iat;
    const exp = tokenPayload.exp;

    expect(exp - iat).to.be.equal(2 * 60 * 60 * 24);
  });

  it('should have 7 days expiration token with rememberMe', async () => {
    const userPredefinedData = queryCreateUser.variables.data;
    const user = await User.getRepository().findOne({ email: userPredefinedData.email });

    const token = generateJwt(user, true);
    const decodedToken = verifyJwt(token);
    const tokenPayload = decodedToken as JwtPayload;
    const iat = tokenPayload.iat;
    const exp = tokenPayload.exp;

    expect(exp - iat).to.be.equal(7 * 60 * 60 * 24);
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
