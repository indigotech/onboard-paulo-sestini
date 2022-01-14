import { startServer } from '../src/setup';
import * as dotenv from 'dotenv';
import { clearDatabase } from './utils';

before(async () => {
  dotenv.config({ path: __dirname + '/../test.env' });
  await startServer();
  await clearDatabase();
});

after(async () => {
  await clearDatabase();
});

require('./create-user.test.ts');
require('./login.test.ts');
require('./user.test.ts');
require('./users.test.ts');
