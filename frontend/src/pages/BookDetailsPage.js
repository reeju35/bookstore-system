import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const BookDetailsPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await API.get(`/books/${id}`);
        setBook(data);
      } catch (error) {
        console.error("Error fetching book:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const addToCartHandler = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existItem = cart.find((item) => item._id === book._id);

    if (existItem) {
      existItem.qty += qty;
    } else {
      cart.push({ ...book, qty });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart");
  };

  if (loading) return <p>Loading...</p>;
  if (!book) return <p>Book not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{book.title}</h2>
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>Genre:</strong> {book.genre}</p>
      <p><strong>Price:</strong> ₹{book.price}</p>
      <p><strong>Stock:</strong> {book.stock}</p>
      <p>{book.description}</p>

      {book.stock > 0 && (
        <>
          <select
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          >
            {[...Array(book.stock).keys()].map((x) => (
              <option key={x + 1} value={x + 1}>
                {x + 1}
              </option>
            ))}
          </select>

          <button onClick={addToCartHandler} style={{ marginLeft: "10px" }}>
            Add to Cart
          </button>
        </>
      )}
    </div>
  );
};

export default BookDetailsPage;