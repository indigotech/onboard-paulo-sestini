import { populateDatabase } from '../src/database-seed/seed-script';
import { User } from '../src/entity/user';
import * as request from 'supertest';
import { expect } from 'chai';
import { generateJwt } from '../src/token';
import { clearDatabase, generateAddresses } from './utils';

describe('Query users', () => {
  before(async () => {
    await populateDatabase(defaultNumberOfUsersToGenerate);
  });

  afterEach(async () => {
    queryUsers.variables.quantity = 5;
    queryUsers.variables.skip = 2;
  });

  after(async () => {
    await clearDatabase();
  });

  it('should return users ordered by name with right quantity', async () => {
    const userRepository = User.getRepository();
    const users = await userRepository.find({
      order: { name: 'ASC' },
      take: queryUsers.variables.quantity,
      skip: queryUsers.variables.skip,
    });
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);
    const responseUsers = response.body.data.users.users;

    expect(responseUsers.length).to.be.equal(queryUsers.variables.quantity);

    for (let i = 0; i < users.length; i++) {
      const databaseUser = users[i];
      const queriedUser = responseUsers[i];

      expect(queriedUser).to.be.deep.equal({
        id: databaseUser.id,
        name: databaseUser.name,
        email: databaseUser.email,
        birthDate: databaseUser.birthDate,
        addresses: databaseUser.addresses,
      });
    }
  });

  it('should set hasBefore to false if skip is 0', async () => {
    queryUsers.variables.skip = 0;
    const userRepository = User.getRepository();
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);

    expect(response.body.data.users.hasBefore).to.be.equal(false);
  });

  it('should set hasBefore to true if skip is not 0', async () => {
    queryUsers.variables.skip = 3;
    const userRepository = User.getRepository();
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);

    expect(response.body.data.users.hasBefore).to.be.equal(true);
  });

  it('should set hasAfter to false if the returned users are the last', async () => {
    queryUsers.variables.skip = 2;
    queryUsers.variables.quantity = defaultNumberOfUsersToGenerate - 2;
    const userRepository = User.getRepository();
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);

    expect(response.body.data.users.hasAfter).to.be.equal(false);
  });

  it("should set hasAfter to true if the returned users aren't the last", async () => {
    queryUsers.variables.skip = 2;
    queryUsers.variables.quantity = defaultNumberOfUsersToGenerate - 3;
    const userRepository = User.getRepository();
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);

    expect(response.body.data.users.hasAfter).to.be.equal(true);
  });

  it("should return the possible amount of users if there isn't the quantity requested", async () => {
    queryUsers.variables.skip = 2;
    queryUsers.variables.quantity = defaultNumberOfUsersToGenerate;
    const userRepository = User.getRepository();
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);

    expect(response.body.data.users.quantity).to.be.equal(defaultNumberOfUsersToGenerate - queryUsers.variables.skip);
  });

  it('should return empty list if skip if greater than amount of users', async () => {
    queryUsers.variables.skip = defaultNumberOfUsersToGenerate + 1;
    queryUsers.variables.quantity = defaultNumberOfUsersToGenerate;
    const userRepository = User.getRepository();
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);

    expect(response.body.data.users.quantity).to.be.equal(0);
    expect(response.body.data.users.users).to.be.empty;
  });

  it('should block access if token is invalid', async () => {
    const response = await request('localhost:4000')
      .post('/')
      .send(queryUsers)
      .set('Authorization', '87asdjh23h8ad7ashd128397');
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Authentication failed.');
    expect(error.code).to.be.equal(401);
    expect(error.additionalInfo).to.be.equal('Invalid JWT token.');
  });

  it('should block access if no token is provided', async () => {
    const response = await request('localhost:4000').post('/').send(queryUsers);
    const error = response.body.errors[0];

    expect(error.message).to.be.equal('Authentication failed.');
    expect(error.code).to.be.equal(401);
    expect(error.additionalInfo).to.be.equal('Missing JWT token.');
  });

  it('should return addresses if they exist', async () => {
    queryUsers.variables.quantity = 1;
    queryUsers.variables.skip = 0;

    const addresses = generateAddresses();

    const userRepository = User.getRepository();
    const users = await userRepository.find({
      order: { name: 'ASC' },
      take: 1,
      skip: 0,
    });
    users[0].addresses = addresses;
    await userRepository.save(users[0]);

    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);
    const responseAddresses = response.body.data.users.users[0].addresses;

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

const defaultNumberOfUsersToGenerate = 12;

const queryUsers = {
  query: `
    query getUsers($quantity: Int, $skip: Int) {
      users(quantity: $quantity, skip: $skip) {
        users {
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
        quantity
        hasBefore
        hasAfter
      }
    }
  `,
  variables: {
    quantity: 5,
    skip: 2,
  },
};
