import React, { useState } from "react";
import { login } from "../api";
import logoImg from "../assets/img/company-logo.png";
import bgImage from "../assets/img/bgi.jpg";

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.token) {
        onLoginSuccess(res.token, res.user);
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .animate-entrance {
            animation: slideInRight 1s ease-out forwards;
          }

          .input-hover:focus {
            border-color: rgba(255, 255, 255, 0.8) !important;
            background: rgba(255, 255, 255, 0.3) !important;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
          }

          .btn-hover:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            background: #f8f9fa !important;
          }
          
          .btn-hover:active {
            transform: translateY(-1px);
          }
        `}
      </style>

      <div style={styles.loginCard} className="animate-entrance">
        <div style={styles.logoSection}>
          <div style={styles.logoWrapper}>
            <img 
              src={logoImg} 
              alt="Company Logo" 
              style={styles.logoImage} 
            />
          </div>
          <h1 style={styles.title}>MOM Dashboard</h1>
          <p style={styles.subtitle}>Minutes of Meeting System</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
              className="input-hover"
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              className="input-hover"
              required
              disabled={loading}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button 
            type="submit" 
            style={styles.loginBtn}
            className="btn-hover"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '0 5% 0 0', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
    overflow: 'hidden',
  },
  loginCard: {
    background: 'rgba(255, 255, 255, 0.12)', 
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '380px',
    backdropFilter: 'blur(15px)', 
    border: '1px solid rgba(255, 255, 255, 0.15)',
    textAlign: 'left',
    opacity: 0,
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  
  // ✅ UPDATED: Solid background to make the logo pop
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
    background: '#ffffff', // Solid white background
    padding: '10px',
    borderRadius: '12px',
    width: 'fit-content',
    margin: '0 auto 1rem auto',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  
  // ✅ UPDATED: Removed the brightness/invert filter
  logoImage: {
    height: '50px',
    objectFit: 'contain'
  },
  
  title: {
    fontSize: '1.9rem',
    fontWeight: 800,
    color: '#ffffff', 
    margin: '0 0 0.5rem 0',
    letterSpacing: '-1px',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.95rem',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  input: {
    padding: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  error: {
    background: 'rgba(220, 38, 38, 0.2)',
    color: '#ff8a8a',
    padding: '1rem',
    borderRadius: '12px',
    borderLeft: '4px solid #ef4444',
  },
  loginBtn: {
    padding: '1.2rem',
    background: '#ffffff', 
    color: '#764ba2',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease', 
    marginTop: '1rem',
  },
};

export default LoginPage;