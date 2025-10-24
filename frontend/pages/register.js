import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    try {
      await axios.post("http://localhost:5194/api/auth/register", {
        username,
        password,
      });
      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data || err.message || "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register - Learning Tracker</title>
        <meta name="description" content="Create your Learning Tracker account" />
      </Head>
      
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h1 className="auth-title">Start Your Journey</h1>
            <p className="auth-subtitle">Create your account and begin tracking your learning progress</p>
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
            
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Choose a username"
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
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
                  Sign in here
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
