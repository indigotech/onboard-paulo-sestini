import { startServer } from '../src/setup';
import * as dotenv from 'dotenv';
import { User } from '../src/entity/user';

before(async () => {
  dotenv.config({ path: __dirname + '/../test.env' });
  await startServer();
  const userRepository = User.getRepository();
  await userRepository.clear();
});

after(async () => {
  const userRepository = User.getRepository();
  await userRepository.clear();
});

require('./create-user.test.ts');
require('./login.test.ts');
require('./user.test.ts');
require('./users.test.ts');

