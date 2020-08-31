
const authResolver = require('./auth');
const propertyResolvers = require('./property')

const rootResolver = {
  ...authResolver,
  ...propertyResolvers
};

module.exports = rootResolver;