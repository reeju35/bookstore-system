const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    genre: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    isbn: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    },
    imageUrl: {
      type: String
    },
    isDeleted: {
  type: Boolean,
  default: false
},

  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Book", bookSchema);
