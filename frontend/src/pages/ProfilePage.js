import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/users/profile");
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.put("/users/profile", {
        name,
        email,
        password,
      });

      localStorage.setItem("userInfo", JSON.stringify({
        ...userInfo,
        name: data.name,
        email: data.email,
      }));

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "30px auto" }}>
      <h2>👤 User Profile</h2>

      <form onSubmit={submitHandler}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          style={inputStyle}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={inputStyle}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password (optional)"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Update Profile
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "15px",
  padding: "10px",
};

const buttonStyle = {
  padding: "10px 15px",
  background: "black",
  color: "white",
  border: "none",
  cursor: "pointer",
};

export default ProfilePage;