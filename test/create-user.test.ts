import * as request from 'supertest';
import { expect } from 'chai';
import { User } from '../src/entity/user';
import * as bcrypt from 'bcrypt';
import { generateJwt } from '../src/token';

describe('Mutation createUser', () => {
  beforeEach(async () => {
    const user = new User();
    user.create({
      name: 'Pre-existing user',
      email: 'existing@email.com',
      password: 'some_password',
      birthDate: '01-01-2001',
    });
    await User.getRepository().save(user);
  });

  afterEach(async () => {
    const userRepository = User.getRepository();
    await userRepository.clear();

    queryCreateUser.variables.data.email = defaultUserTestEmail;
    queryCreateUser.variables.data.password = defaultUserTestPassword;
  });

  it('should create user on database and return its info', async () => {
    const preExistingUser = await User.getRepository().findOne({ email: 'existing@email.com' });
    const jwtToken = generateJwt(preExistingUser, false);
    const userRepository = User.getRepository();
    const userPredefinedData = queryCreateUser.variables.data;

    const response = await request('localhost:4000').post('/').send(queryCreateUser).set('Authorization', jwtToken);
    const user = await userRepository.findOne({ email: userPredefinedData.email });
    const responseUserInfo = response.body.data.createUser;

    expect(responseUserInfo.id).to.be.a('number').greaterThan(0);
    expect(responseUserInfo.name).to.be.equal(userPredefinedData.name);
    expect(responseUserInfo.email).to.be.equal(userPredefinedData.email);
    expect(responseUserInfo.birthDate).to.be.equal(userPredefinedData.birthDate);
    expect(user.id).to.be.equal(responseUserInfo.id);
    expect(user.name).to.be.equal(userPredefinedData.name);
    expect(user.email).to.be.equal(userPredefinedData.email);
    expect(user.birthDate).to.be.equal(userPredefinedData.birthDate);
  });

  it('should hash password', async () => {
    const preExistingUser = await User.getRepository().findOne({ email: 'existing@email.com' });
    const jwtToken = generateJwt(preExistingUser, false);
    const userPredefinedData = queryCreateUser.variables.data;
    const userRepository = User.getRepository();
    const plainPassword = userPredefinedData.password;

    await request('localhost:4000').post('/').send(queryCreateUser).set('Authorization', jwtToken);
    const user = await userRepository.findOne({ email: userPredefinedData.email });

    expect(await bcrypt.compare(plainPassword, user.password)).to.be.true;
  });

  it('should give an error if email is duplicated', async () => {
    const preExistingUser = await User.getRepository().findOne({ email: 'existing@email.com' });
    const jwtToken = generateJwt(preExistingUser, false);
    const userPredefinedData = queryCreateUser.variables.data;
    userPredefinedData.email = preExistingUser.email;
    const userRepository = User.getRepository();
    const users = await userRepository.find({ email: userPredefinedData.email });

    const response = await request('localhost:4000').post('/').send(queryCreateUser).set('Authorization', jwtToken);
    const message = response.body.errors[0].message;

    expect(message).to.be.equal('Email is already in use.');
    expect(users.length).to.be.equal(1);
  });

  it('should not let password less than 6 characters long', async () => {
    const preExistingUser = await User.getRepository().findOne({ email: 'existing@email.com' });
    const jwtToken = generateJwt(preExistingUser, false);
    queryCreateUser.variables.data.password = 'abc';

    const response = await request('localhost:4000').post('/').send(queryCreateUser).set('Authorization', jwtToken);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Password is too short, needs at least 6 characters.');
    expect(error.code).to.be.equal(400);
  });

  it('should not let password without at least 1 digit', async () => {
    const preExistingUser = await User.getRepository().findOne({ email: 'existing@email.com' });
    const jwtToken = generateJwt(preExistingUser, false);
    queryCreateUser.variables.data.password = 'abcdef';

    const response = await request('localhost:4000').post('/').send(queryCreateUser).set('Authorization', jwtToken);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Password needs at least 1 digit.');
    expect(error.code).to.be.equal(400);
  });

  it('should not let password without at least 1 letter', async () => {
    const preExistingUser = await User.getRepository().findOne({ email: 'existing@email.com' });
    const jwtToken = generateJwt(preExistingUser, false);
    queryCreateUser.variables.data.password = '123456';

    const response = await request('localhost:4000').post('/').send(queryCreateUser).set('Authorization', jwtToken);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Password needs at least 1 letter.');
    expect(error.code).to.be.equal(400);
  });

  it('should not let create user if not authenticated', async () => {
    const response = await request('localhost:4000').post('/').send(queryCreateUser);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Authentication failed.');
    expect(error.code).to.be.equal(401);
    expect(error.additionalInfo).to.be.equal('Missing JWT token.');
  });

  it('should not let create user if jwt token is invalid', async () => {
    const response = await request('localhost:4000')
      .post('/')
      .send(queryCreateUser)
      .set('Authorization', '8798789123123nasdjkasd89a7897');

    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Authentication failed.');
    expect(error.code).to.be.equal(401);
    expect(error.additionalInfo).to.be.equal('Invalid JWT token.');
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
