import { useEffect, useState } from "react";
import API from "../services/api";

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState("");
  const [genre, setGenre] = useState("");
  const [stock, setStock] = useState("");
  const [isbn, setIsbn] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data } = await API.get("/books?page=1");
      setBooks(data.books);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await API.delete(`/books/${id}`, {
          headers: {
            Authorization: `Bearer ${userInfo.accessToken}`,
          },
        });

        setBooks(books.filter((book) => book._id !== id));
      } catch (error) {
        console.error(error.response?.data || error);
        alert("Delete failed");
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // 🔥 UPDATE BOOK
        const { data } = await API.put(
          `/books/${editId}`,
          { title, author, price, genre, stock, isbn },
          {
            headers: {
              Authorization: `Bearer ${userInfo.accessToken}`,
            },
          }
        );

        setBooks(
          books.map((book) =>
            book._id === editId ? data : book
          )
        );

        alert("Book updated successfully");
        setEditId(null);
      } else {
        // 🔥 CREATE BOOK
        const { data } = await API.post(
          "/books",
          { title, author, price, genre, stock, isbn },
          {
            headers: {
              Authorization: `Bearer ${userInfo.accessToken}`,
            },
          }
        );

        setBooks([...books, data]);
        alert("Book added successfully");
      }

      // Clear form
      setTitle("");
      setAuthor("");
      setPrice("");
      setGenre("");
      setStock("");
      setIsbn("");
    } catch (error) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const editHandler = (book) => {
    setEditId(book._id);
    setTitle(book.title);
    setAuthor(book.author);
    setPrice(book.price);
    setGenre(book.genre);
    setStock(book.stock);
    setIsbn(book.isbn);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📚 Admin - Manage Books</h2>

      {/* 🔥 ADD / EDIT BOOK FORM */}
      <form onSubmit={submitHandler} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="ISBN"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          required
        />

        <button
          type="submit"
          style={{
            marginLeft: "10px",
            background: editId ? "blue" : "green",
            color: "white",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {editId ? "Update Book" : "Add Book"}
        </button>
      </form>

      {/* 🔥 BOOK LIST */}
      {books.map((book) => (
        <div
          key={book._id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h4>{book.title}</h4>
          <p>₹{book.price}</p>

          <button
            onClick={() => editHandler(book)}
            style={{
              background: "blue",
              color: "white",
              border: "none",
              padding: "5px 10px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>

          <button
            onClick={() => deleteHandler(book._id)}
            style={{
              background: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminBooksPage;