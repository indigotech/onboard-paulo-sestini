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

    expect(responseUserData).to.be.deep.equal({
      id: secondUser.id,
      name: secondUser.name,
      email: secondUser.email,
      birthDate: secondUser.birthDate,
      addresses: secondUser.addresses,
    });
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
      expect(responseAddresses[i]).to.be.deep.equal({
        cep: addresses[i].cep,
        street: addresses[i].street,
        streetNumber: addresses[i].streetNumber,
        neighborhood: addresses[i].neighborhood,
        city: addresses[i].city,
        state: addresses[i].state,
        complement: addresses[i].complement,
        id: addresses[i].id,
      });
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
          cep
          street
          streetNumber
          neighborhood
          city
          state
          complement
          id
        }
      }
    }
  `,
  variables: {
    id: 0,
  },
};
