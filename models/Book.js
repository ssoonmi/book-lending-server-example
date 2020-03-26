const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    required: true,
    default: false
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author'
  }
});

// statics on a schema are functions that be called on the model itself (e.g. Book.borrowBooks(...))
BookSchema.statics.borrowBooks = function (bookIds, loggedInUser) {
  const Book = this; // this is the Book model
  return (async () => {
    const books = [];
    const alreadyBookedBookIds = [];
    // for each book id, find the book
    // if the booked is not checked out, mark it as booked and add it to the user's list of books
    // if it is checked out, user cannot check it out
    for(let i = 0; i < bookIds.length; i++) {
      const bookId = bookIds[i];
      const book = await Book.findById(bookId);
      if (book.isBooked === false) {
        book.isBooked = true;
        loggedInUser.books.addToSet(bookId);
        books.push(await book.save());
      } else {
        alreadyBookedBookIds.push(bookId);
      }
    }
    await loggedInUser.save();
    const success = books.length === bookIds.length;
    const message = success
      ? 'books checked out successfully'
      : `the following books could not be checked out: ${alreadyBookedBookIds}`;
    return {
      success,
      message,
      books
    };
  })();
}

// methods on a schema are functions that can be called on a document of the model (e.g. book.returnBook(...))
BookSchema.methods.returnBook = function (loggedInUser) {
  const book = this; // "this" is the book document
  return (async () => {
    if (loggedInUser && loggedInUser.books.includes(this._id)) {
      loggedInUser.books.remove(this._id);
      await loggedInUser.save();
      book.isBooked = false;
      return {
        success: true,
        message: 'book returned',
        books: [await book.save()]
      };
    } else {
      return {
        success: false,
        message: `book with id ${this._id} could not be returned`,
        books: null
      }
    }
  })();
}

module.exports = mongoose.model('Book', BookSchema);