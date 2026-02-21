const Book = require("../models/Book");
const asyncHandler = require("express-async-handler");
const logActivity = require("../utils/logActivity");


// @desc Create new book
// @route POST /api/books
// @access Admin
const createBook = asyncHandler(async (req, res) => {
  const { title, author, price, genre, stock, isbn, description, imageUrl } = req.body;

  if (!title || !author || !price || !genre || !stock || !isbn) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const bookExists = await Book.findOne({ isbn });

  if (bookExists) {
    res.status(400);
    throw new Error("Book with this ISBN already exists");
  }

  const book = await Book.create({
    title,
    author,
    price,
    genre,
    stock,
    isbn,
    description,
    imageUrl
  });

  res.status(201).json(book);
});


// @desc Get all books with search & pagination
// @route GET /api/books
// @access Public
const getBooks = asyncHandler(async (req, res) => {
  const pageSize = 5;
  const page = Number(req.query.page) || 1;

  const searchFilter = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: "i" } },
          { author: { $regex: req.query.keyword, $options: "i" } }
        ]
      }
    : {};

  const baseFilter = {
    $and: [
      searchFilter,
      {
        $or: [
          { isDeleted: false },
          { isDeleted: { $exists: false } }
        ]
      }
    ]
  };

  const count = await Book.countDocuments(baseFilter);

  const books = await Book.find(baseFilter)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    books,
    page,
    pages: Math.ceil(count / pageSize)
  });
});



// @desc Get single book by ID
// @route GET /api/books/:id
// @access Public
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book || book.isDeleted) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.json(book);
});


// @desc Update book
// @route PUT /api/books/:id
// @access Admin
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book || book.isDeleted) {
    res.status(404);
    throw new Error("Book not found");
  }

  const {
    title,
    author,
    price,
    genre,
    stock,
    isbn,
    description,
    imageUrl
  } = req.body;

  book.title = title || book.title;
  book.author = author || book.author;
  book.price = price || book.price;
  book.genre = genre || book.genre;
  book.stock = stock ?? book.stock;
  book.isbn = isbn || book.isbn;
  book.description = description || book.description;
  book.imageUrl = imageUrl || book.imageUrl;

  const updatedBook = await book.save();

  res.json(updatedBook);
});


// @desc Soft delete book
// @route DELETE /api/books/:id
// @access Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  // Soft delete
  book.isDeleted = true;
  await book.save();

  // 🔥 Admin activity log
  await logActivity(
    req.user._id,
    "DELETE_BOOK",
    book._id,
    "Book soft deleted"
  );

  res.json({ message: "Book soft deleted successfully" });
});



module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook
};
