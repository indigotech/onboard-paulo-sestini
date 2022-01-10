import * as request from 'supertest';
import { startServer } from '../src/setup';

before(async () => {
  await startServer();
});

describe('Print test', () => {
  it('Printing', () => {
    console.log('Test ran');
  });
});

describe('Access the server', () => {
  it('Query hello', async () => {
    const response = await request('localhost:4000').post('/').send({
      query: '{ hello }',
    });

    console.log(response.text);
  });
});
