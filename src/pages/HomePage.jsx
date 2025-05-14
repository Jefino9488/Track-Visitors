import { Link } from 'react-router-dom';
import '../App.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Visitor Entry Tracking System</h1>
        <p>Welcome to our visitor management system</p>
      </header>
      
      <div className="home-actions">
        <Link to="/sign-in" className="action-button sign-in">
          <div className="action-icon">📝</div>
          <div className="action-text">
            <h2>Visitor Sign In</h2>
            <p>Register your visit and get a visitor number</p>
          </div>
        </Link>
        
        <Link to="/sign-out" className="action-button sign-out">
          <div className="action-icon">🚪</div>
          <div className="action-text">
            <h2>Visitor Sign Out</h2>
            <p>Record your departure using your visitor number</p>
          </div>
        </Link>
      </div>
      
      <footer className="home-footer">
        <Link to="/admin/login" className="admin-link">Admin Portal</Link>
      </footer>
    </div>
  );
};

export default HomePage;