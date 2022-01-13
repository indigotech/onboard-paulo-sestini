import * as request from 'supertest';
import { expect } from 'chai';

describe('Access the server', () => {
    it('should return hello world', async () => {
      const response = await request('localhost:4000').post('/').send({
        query: '{ hello }',
      });
  
      expect(response.body.data.hello).to.be.eq('Hello, world!');
    });
  });