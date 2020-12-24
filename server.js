var express = require('express');
var { graphqlHTTP } = require('express-graphql');
const multer = require("multer");


const isAuth = require('./middleware/is-auth')


const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const upload = require('./upload/upload');
const im_func = require('./upload/image');
var app = express();


app.use(isAuth)
app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true,
}));


app.post('/upload', upload);

app.get("/image", im_func);
// change this to normal serve

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

