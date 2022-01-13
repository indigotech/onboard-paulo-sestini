import { populateDatabase } from '../src/database-seed/seed-script';
import { User } from '../src/entity/user';
import * as request from 'supertest';
import { expect } from 'chai';
import { generateJwt } from '../src/token';

describe('Query users', () => {
  before(async () => {
    await populateDatabase(defaultNumberOfUsersToGenerate);
  });

  afterEach(async () => {
    queryUsers.variables.quantity = 5;
    queryUsers.variables.skip = 2;
  });

  after(async () => {
    const userRepository = User.getRepository();
    await userRepository.clear();
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

      expect(queriedUser.id).to.be.equal(databaseUser.id);
      expect(queriedUser.name).to.be.equal(databaseUser.name);
      expect(queriedUser.email).to.be.equal(databaseUser.email);
      expect(queriedUser.birthDate).to.be.equal(databaseUser.birthDate);
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
});

const defaultNumberOfUsersToGenerate = 12;

const queryUsers = {
  query: `
    query getUsers($quantity: Int, $skip: Int){
      users(quantity: $quantity, skip: $skip){
        users {
            id,
            name,
            email,
            birthDate
        },
        quantity,
        hasBefore,
        hasAfter
      }
    }
  `,
  variables: {
    quantity: 5,
    skip: 2,
  },
};
