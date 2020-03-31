const mongoose = require('mongoose');

const User = mongoose.model('User');
const Book = mongoose.model('Book');
const Author = mongoose.model('Author');

const typeDefs = `
  type Book {
    _id: ID!
    title: String
    isBooked: Boolean!
    author: Author
  }
  extend type Query {
    books: [Book]
    book(_id: ID!): Book
  }
  extend type Mutation {
    borrowBooks(bookIds: [ID]!): BookUpdateResponse!
    returnBook(bookId: ID!): BookUpdateResponse!
  }
  type BookUpdateResponse {
    success: Boolean!
    message: String
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books(_, __) {
      return Book.find({});
    },
    book(_, { _id }) {
      return Book.findById(_id);
    }
  },
  Mutation: {
    borrowBooks(_, { bookIds }, context) {
      const loggedInUser = context.user;
      if (!loggedInUser) return {
        success: false,
        message: 'Need to log in to borrow books',
        books: []
      }
      return Book.borrowBooks(bookIds, loggedInUser);
    },
    returnBook: async (_, { bookId }, context) => {
      const loggedInUser = context.user;
      if (!loggedInUser) return {
        success: false,
        message: 'Need to log in to return books',
        books: []
      }
      const book = await Book.findById(bookId);
      return book.returnBook(loggedInUser);
    }
  },
  Book: {
    author: async (parentValue, _) => {
      const book = parentValue;
      await book.populate('author').execPopulate();
      return book.author;
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
};