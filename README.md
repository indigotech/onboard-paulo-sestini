# Estus Server ⚗️
A simple graphql server being implemented for learning purpose

## Environment and tools
The server requires npm to be installed, and it is made using *Apollo Server / GraphQL* and *TypeScript*
## Steps to run and debug

### Starting the server
First, run `npm install` to install the necessary packages

Then, to start the server, run `npm start`

### Running the query
The **hello** query can be tested by accessing *Apollo Server* on the browser at `http://localhost:4000/`

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
