import * as request from 'supertest';
import { expect } from 'chai';
import { User } from '../src/entity/user';
import { generateJwt } from '../src/token';
import { clearDatabase, generateAddresses } from './utils';

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

    await User.getRepository().save([firstUser, secondUser]);
  });

  afterEach(async () => {
    queryUser.variables.id = 0;
    await clearDatabase();
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

  it('should return addresses if they exist', async () => {
    const addresses = generateAddresses();

    const userRepository = User.getRepository();
    const firstUser = await userRepository.findOne({ email: 'first@user.com' });
    const secondUser = await userRepository.findOne({ email: 'second@user.com' });
    secondUser.addresses = addresses;

    await userRepository.save(secondUser);

    const firstUserToken = generateJwt(firstUser, false);
    queryUser.variables.id = secondUser.id;

    const response = await request('localhost:4000').post('/').send(queryUser).set('Authorization', firstUserToken);
    const responseAddresses = response.body.data.user.addresses;

    for (let i = 0; i < addresses.length; i++) {
      expect(responseAddresses[i].cep).to.be.equal(addresses[i].cep);
      expect(responseAddresses[i].street).to.be.equal(addresses[i].street);
      expect(responseAddresses[i].streetNumber).to.be.equal(addresses[i].streetNumber);
      expect(responseAddresses[i].neighborhood).to.be.equal(addresses[i].neighborhood);
      expect(responseAddresses[i].city).to.be.equal(addresses[i].city);
      expect(responseAddresses[i].state).to.be.equal(addresses[i].state);
      expect(responseAddresses[i].complement).to.be.equal(addresses[i].complement);
      expect(responseAddresses[i].id).to.be.equal(addresses[i].id);
    }
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
        addresses {
          id
          cep
          street
          streetNumber
          complement
          neighborhood
          city
          state
        }
      }
    }
  `,
  variables: {
    id: 0,
  },
};
