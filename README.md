# Estus Server ⚗️

A simple graphql server being implemented for learning purpose

## Environment and tools

The server requires npm and docker/docker-compose to be installed, and it is made using _Apollo Server / GraphQL_ , _TypeScript_ and PostgreSQL

## Steps to run and debug

### Starting the database

Run `docker-compose up` to start the PostgreSQL container

To stop the database, run `docker-compose down`

### Starting the server

First, run `npm install` to install the necessary packages

Then, to start the server, run `npm start`

### Running the hello query

The **hello** query can be tested by accessing _Apollo Server_ on the browser at `http://localhost:4000/`

Input:

```
{
    hello
}
```

Return:

```
{
  "data": {
    "hello": "Hello, world!"
  }
}
```

### Running the **createUser** mutation

input:

```
mutation createUserMutation($data: UserInput){
  createUser(data: $data){
    id,
    name,
    email,
    birthDate
  }
}
```

variables:

```
{
  "data": {
    "name": "Paulo Otavio",
    "email": "otavio@paulo.com",
    "password": "1234",
    "birthDate": "01-01-2001"
  }
}
```

return:

```
{
  "data": {
    "createUser": {
      "id": 20,
      "name": "Paulo Otavio",
      "email": "otavio@paulo.com",
      "birthDate": "01-01-2001"
    }
  }
}
```
