export const queryCreateUser = {
  query: `
      mutation createUserMutation($data: UserInput){
        createUser(data: $data){
          id,
          name,
          email,
          birthDate
        }
      }`,
  variables: {
    data: {
      name: 'Paulo Otavio',
      email: 'paulo@otavio.com',
      password: 'abc123',
      birthDate: '01-01-2001',
    },
  },
};
