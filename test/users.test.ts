import { populateDatabase } from '../src/database-seed/seed-script';
import { User } from '../src/entity/user';
import * as request from 'supertest';
import { expect } from 'chai';
import { generateJwt } from '../src/token';

describe('Query users', () => {
  beforeEach(async () => {
    await populateDatabase(7);
  });

  afterEach(async () => {
    queryUsers.variables.quantity = 5;
    const userRepository = User.getRepository();
    await userRepository.clear();
  });

  it('should run query users and return users ordered by name', async () => {
    queryUsers.variables.quantity = 5;
    const userRepository = User.getRepository();
    const users = await userRepository.find({
      order: { name: 'ASC' },
      take: 5,
      skip: 0,
    });
    const someUser = await userRepository.findOne();
    const token = generateJwt(someUser, false);

    const response = await request('localhost:4000').post('/').send(queryUsers).set('Authorization', token);
    const responseUsers = response.body.data.users;

    expect(responseUsers.length).to.be.equal(5);
    for (let i = 0; i < users.length; i++) {
      const databaseUser = users[i];
      const queriedUser = responseUsers[i];

      expect(queriedUser.id).to.be.equal(databaseUser.id);
      expect(queriedUser.name).to.be.equal(databaseUser.name);
      expect(queriedUser.email).to.be.equal(databaseUser.email);
      expect(queriedUser.birthDate).to.be.equal(databaseUser.birthDate);
    }
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

const queryUsers = {
  query: `
    query getUsers($quantity: Int){
      users(quantity: $quantity){
          id,
          name,
          email,
          birthDate
      }
    }
  `,
  variables: {
    quantity: 5,
  },
};
