const mongoose = require('mongoose');
const { makeExecutableSchema } = require('graphql-tools');
const { merge } = require('lodash');
const types = require('./types');

const typeDefs = `
  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
`;

const resolvers = {
  // ... other resolvers
}

module.exports = {
  schema: makeExecutableSchema({
    typeDefs: [...types.map(type => type.typeDefs), typeDefs],
    resolvers: merge(...types.map(type => type.resolvers), resolvers),
    logger: { log: e => console.log('\x1b[31m%s\x1b[0m', e.message) }
  }),
  typeDefs,
  resolvers
}