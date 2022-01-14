import { User } from '../src/entity/user';
import { Address } from '../src/entity/address';

export async function clearDatabase() {
  const addressRepository = Address.getRepository();
  await addressRepository.delete({});

  const userRepository = User.getRepository();
  await userRepository.delete({});
}

export function generateAddresses() {
  const address1 = new Address();
  address1.cep = '12387';
  address1.street = 'Sesamo';
  address1.streetNumber = 42;
  address1.neighborhood = 'Chaves';
  address1.city = 'Votuporanga';
  address1.state = 'São Paulo';

  const address2 = new Address();
  address2.cep = '54352';
  address2.street = 'Paulista';
  address2.streetNumber = 123;
  address2.neighborhood = 'Chaves';
  address2.city = 'São Paulo';
  address2.state = 'São Paulo';

  return [address1, address2];
}
