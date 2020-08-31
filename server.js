var express = require('express');
var { graphqlHTTP } = require('express-graphql');

const isAuth = require('./middleware/is-auth')


const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');


var app = express();

app.use(isAuth)
app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true,
}));

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

