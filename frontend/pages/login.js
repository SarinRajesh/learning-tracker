import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("http://localhost:5194/api/auth/login", {
        username,
        password,
      });
      const { userId } = res.data;
      localStorage.setItem("userId", userId);
      router.push("/tasks");
    } catch (err) {
      setError(err.response?.data || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Learning Tracker</title>
        <meta name="description" content="Sign in to your Learning Tracker account" />
      </Head>
      
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue your learning journey</p>
          </div>
          
          <div className="auth-body">
            {error && (
              <div style={{ 
                background: 'var(--danger-color)', 
                color: 'white', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius)', 
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '1.5rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Don't have an account?{' '}
                <Link href="/register" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
                  Create one here
                </Link>
              </p>
              <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
