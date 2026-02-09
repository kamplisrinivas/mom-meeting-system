import React, { useState } from "react";
import { login } from "./api";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(email, password);
      if (res.token) {
        setToken(res.token);
        localStorage.setItem("token", res.token);
        setUser(res.user);
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Check console for details.");
      console.error(err);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  if (!token || !user) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>MOM Frontend 🚀</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogout} style={{ float: "right", margin: "10px" }}>
        Logout
      </button>
      <Dashboard token={token} user={user} />
    </div>
  );
}