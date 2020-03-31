const mongoose = require('mongoose');

const User = mongoose.model('User');
const Book = mongoose.model('Book');
const Author = mongoose.model('Author');

const typeDefs = `
  type User {
    _id: ID!
    username: String!
    books: [Book]
  }
  extend type Query {
    me: User
  }
  extend type Mutation {
    login(username: String!, password: String!): UserCredentials
  }
  type UserCredentials {
    _id: ID!
    username: String!
    token: String
    loggedIn: Boolean
  }
`;

const resolvers = {
  Query: {
    me(_, __, context) {
      // context.user is the logged-in user
      return context.user;
    }
  },
  Mutation: {
    login(_, { username, password }) {
      // login method used in MERN project
      return User.login(username, password);
    }
  },
  User: {
    books: async (parentValue, _, context) => {
      const queriedUser = parentValue;
      const loggedInUser = context.user;
      // only return the borrowed books of a user if the queried user is the logged in user
      if (loggedInUser && queriedUser._id === loggedInUser._id) {
        await loggedInUser.populate('books').execPopulate();
        return loggedInUser.books;
      }
      return null;
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};