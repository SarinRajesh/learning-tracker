import Link from "next/link";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Learning Tracker - Track Your Learning Journey</title>
        <meta name="description" content="Professional learning management system to track your educational progress" />
      </Head>
      
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link href="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/logo.svg" alt="Learning Tracker" style={{ width: '32px', height: '32px' }} />
              Learning Tracker
            </Link>
            <div className="navbar-nav">
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/register" className="nav-link">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <h1 className="hero-title">Master Your Learning Journey</h1>
              <p className="hero-subtitle">
                Track your educational progress, set goals, and achieve your learning objectives with our professional learning management system.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/register" className="btn btn-primary">
                  Start Learning Today
                </Link>
                <Link href="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src="/hero-illustration.svg" 
                alt="Learning Tracker Dashboard" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Why Choose Learning Tracker?
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Professional tools designed to enhance your learning experience and track your educational progress.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">
                Monitor your learning progress with detailed analytics and visual progress indicators.
              </p>
            </div>
            
            <div className="feature-card fade-in">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Goal Setting</h3>
              <p className="feature-description">
                Set and track learning objectives with smart reminders and milestone celebrations.
              </p>
            </div>
            
            <div className="feature-card fade-in">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Task Management</h3>
              <p className="feature-description">
                Organize your learning tasks with our intuitive task management system.
              </p>
            </div>
            
            <div className="feature-card fade-in">
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Analytics</h3>
              <p className="feature-description">
                Get insights into your learning patterns with comprehensive analytics and reports.
              </p>
            </div>
            
            <div className="feature-card fade-in">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your learning data is protected with enterprise-grade security and privacy controls.
              </p>
            </div>
            
            <div className="feature-card fade-in">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Cross-Platform</h3>
              <p className="feature-description">
                Access your learning tracker from any device with our responsive design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'var(--primary-color)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            Ready to Transform Your Learning?
          </h2>
          <p style={{ fontSize: '1.125rem', opacity: '0.9', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Join thousands of learners who are already tracking their progress and achieving their goals.
          </p>
          <Link href="/register" className="btn btn-secondary" style={{ background: 'white', color: 'var(--primary-color)' }}>
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Learning Tracker</h3>
              <p>Professional learning management system designed to help you achieve your educational goals.</p>
            </div>
            <div className="footer-section">
              <h3>Features</h3>
              <p><a href="#">Progress Tracking</a></p>
              <p><a href="#">Goal Setting</a></p>
              <p><a href="#">Task Management</a></p>
              <p><a href="#">Analytics</a></p>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <p><a href="#">Help Center</a></p>
              <p><a href="#">Contact Us</a></p>
              <p><a href="#">Documentation</a></p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Learning Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
