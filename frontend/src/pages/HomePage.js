import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { theme } from "../styles/theme";

const HomePage = () => {
  const [booksData, setBooksData] = useState({ books: [], pages: 0 });
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get("page") || 1;
  const searchKeyword = searchParams.get("keyword") || "";

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        const { data } = await API.get(
          `/books?page=${page}&keyword=${searchKeyword}`
        );

        setBooksData(data);
      } catch (error) {
        toast.error("Failed to load books");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, searchKeyword]);

  const addToCartHandler = (book) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item._id === book._id);

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({ ...book, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    toast.success(`${book.title} added to cart 🛒`);
  };

  const searchHandler = (e) => {
    e.preventDefault();
    setSearchParams({ keyword, page: 1 });
  };

  return (
    <div style={{ padding: theme.spacing.page }}>
      <h1 style={{ marginBottom: "25px", color: theme.colors.textPrimary }}>
        📚 Explore Books
      </h1>

      {/* SEARCH BAR */}
      <form
        onSubmit={searchHandler}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px"
        }}
      >
        <input
          type="text"
          placeholder="Search by title or author..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            padding: "10px",
            width: "280px",
            borderRadius: theme.radius,
            border: "1px solid #ddd",
            outline: "none"
          }}
        />

        <Button type="submit">Search</Button>
      </form>

      {/* LOADING */}
      {loading && <p>Loading books...</p>}

      {/* BOOK GRID */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "25px"
          }}
        >
          {booksData.books.length === 0 ? (
            <p>No books found</p>
          ) : (
            booksData.books.map((book) => (
              <Card
                key={book._id}
                style={{
                  transition: "0.2s ease",
                  cursor: "pointer"
                }}
              >
                <Link
                  to={`/book/${book._id}`}
                  style={{
                    textDecoration: "none",
                    color: theme.colors.textPrimary
                  }}
                >
                  <h3 style={{ marginBottom: "10px" }}>
                    {book.title}
                  </h3>
                </Link>

                <p style={{ color: theme.colors.textSecondary }}>
                  Author: {book.author}
                </p>

                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginTop: "10px"
                  }}
                >
                  ₹{book.price}
                </p>

                <div style={{ marginTop: "15px" }}>
                  <Button onClick={() => addToCartHandler(book)}>
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && booksData.pages > 1 && (
        <div style={{ marginTop: "40px", display: "flex", gap: "10px" }}>
          {[...Array(booksData.pages).keys()].map((x) => (
            <Button
              key={x + 1}
              variant={Number(page) === x + 1 ? "primary" : "secondary"}
              onClick={() =>
                setSearchParams({
                  keyword: searchKeyword,
                  page: x + 1
                })
              }
            >
              {x + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;