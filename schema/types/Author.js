const mongoose = require('mongoose');

const User = mongoose.model('User');
const Book = mongoose.model('Book');
const Author = mongoose.model('Author');

const typeDefs = `
  type Author {
    _id: ID!
    name: String
    books: [Book]
  }
  extend type Query {
    authors: [Author]
    author(_id: ID!): Author
  }
`;

const resolvers = {
  Query: {
    authors(_, __) {
      return Author.find({});
    },
    author(_, { _id }) {
      return Author.findById(_id);
    }
  },
  Author: {
    books(parentValue, _) {
      const author = parentValue;
      // find all the books who have the queried author as their author
      return Book.find({ author: author._id });
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};