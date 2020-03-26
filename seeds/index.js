const mongoose = require('mongoose');
require('../models');
const db = require('../config/keys').mongoURI;

const bcrypt = require('bcryptjs');
const { Faker } = require('fakergem');

const User = mongoose.model('User');
const Book = mongoose.model('Book');
const Author = mongoose.model('Author');

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.log(err));

const seedDatabase = async () => {
  const hashedPassword = await bcrypt.hash('password', 10);
  const user = new User({ username: 'demo', password: hashedPassword });
  await user.save();

  const authors = [];
  for(let i=0; i < 10; i++) {
    const author = new Author({ name: Faker.Book.author() });
    authors.push(await author.save());
  }

  const books = [];
  for(let j=0; j < 30; j++) {
    const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
    const book = new Book({ title: Faker.Book.title(), author: randomAuthor._id });
    books.push(await book.save());
  }

  for(let k=0; k < 5; k++) {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    randomBook.isBooked = true;
    await randomBook.save();
    user.books.addToSet(randomBook._id);
  }
  await user.save();

  mongoose.connection.close()
}

seedDatabase().then(() => console.log('Successfully seeded database')).catch((e) => console.log('An error occured while seeding', e))