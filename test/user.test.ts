import * as request from 'supertest';
import { expect } from 'chai';
import { User } from '../src/entity/user';
import { generateJwt } from '../src/token';

describe('Query user', () => {
  beforeEach(async () => {
    const firstUser = new User();
    const secondUser = new User();

    firstUser.create({
      name: 'First User',
      email: 'first@user.com',
      password: 'some_password',
      birthDate: '01-01-2001',
    });

    secondUser.create({
      name: 'Second User',
      email: 'second@user.com',
      password: 'some_password',
      birthDate: '01-01-2001',
    });

    await User.getRepository().save(firstUser);
    await User.getRepository().save(secondUser);
  });

  afterEach(async () => {
    queryUser.variables.id = 0;
    const userRepository = User.getRepository();
    await userRepository.clear();
  });

  it('should run query and return user info', async () => {
    const userRepository = User.getRepository();
    const firstUser = await userRepository.findOne({ email: 'first@user.com' });
    const secondUser = await userRepository.findOne({ email: 'second@user.com' });

    const firstUserToken = generateJwt(firstUser, false);
    queryUser.variables.id = secondUser.id;

    const response = await request('localhost:4000').post('/').send(queryUser).set('Authorization', firstUserToken);
    const responseUserData = response.body.data.user;

    expect(responseUserData.id).to.be.equal(secondUser.id);
    expect(responseUserData.name).to.be.equal(secondUser.name);
    expect(responseUserData.email).to.be.equal(secondUser.email);
    expect(responseUserData.birthDate).to.be.equal(secondUser.birthDate);
  });

  it('should inform user not found when id is invalid', async () => {
    const userRepository = User.getRepository();
    const firstUser = await userRepository.findOne({ email: 'first@user.com' });

    const firstUserToken = generateJwt(firstUser, false);
    queryUser.variables.id = 129778891;

    const response = await request('localhost:4000').post('/').send(queryUser).set('Authorization', firstUserToken);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('User not found.');
    expect(error.code).to.be.equal(404);
  });

  it('should block access if token is invalid', async () => {
    queryUser.variables.id = 129778891;

    const response = await request('localhost:4000')
      .post('/')
      .send(queryUser)
      .set('Authorization', '87asdjh23h8ad7ashd128397');
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Authentication failed.');
    expect(error.code).to.be.equal(401);
    expect(error.additionalInfo).to.be.equal('Invalid JWT token.');
  });

  it('should block access if no token is provided', async () => {
    queryUser.variables.id = 129778891;

    const response = await request('localhost:4000').post('/').send(queryUser);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Authentication failed.');
    expect(error.code).to.be.equal(401);
    expect(error.additionalInfo).to.be.equal('Missing JWT token.');
  });
});

const queryUser = {
  query: `
    query getUser($id: Int) {
      user(id: $id) {
        id
        name
        email
        birthDate
      }
    }
  `,
  variables: {
    id: 0,
  },
};
