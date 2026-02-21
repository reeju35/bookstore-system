import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { theme } from "../styles/theme";

const MainLayout = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isAdmin = userInfo?.role === "admin";

  return (
    <div style={{ background: theme.colors.background }}>
      <Navbar />

      <div style={{ display: "flex" }}>
        {isAdmin && <Sidebar />}

        <div
          style={{
            flex: 1,
            marginTop: "70px", // push below navbar
            marginLeft: isAdmin ? "240px" : "0",
            padding: "40px"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;