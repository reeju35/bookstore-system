const express = require("express");
const router = express.Router();

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook
} = require("../controllers/bookController");

const { protect, admin } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book Management APIs
 */


/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books
 */
router.get("/", getBooks);


/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single book data
 *       404:
 *         description: Book not found
 */
router.get("/:id", getBookById);


/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create new book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - price
 *               - genre
 *               - stock
 *               - isbn
 *             properties:
 *               title:
 *                 type: string
 *                 example: Atomic Habits
 *               author:
 *                 type: string
 *                 example: James Clear
 *               price:
 *                 type: number
 *                 example: 499
 *               genre:
 *                 type: string
 *                 example: Self Help
 *               stock:
 *                 type: number
 *                 example: 10
 *               isbn:
 *                 type: string
 *                 example: 1111111111
 *     responses:
 *       201:
 *         description: Book created successfully
 */
router.post("/", protect, admin, createBook);


/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book updated
 */
router.put("/:id", protect, admin, updateBook);


/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Book ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted
 */
router.delete("/:id", protect, admin, deleteBook);

module.exports = router;
