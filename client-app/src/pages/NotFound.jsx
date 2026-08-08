import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ textAlign: 'center', marginTop: '4rem' }}>
    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
    <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Oops! The page you are looking for does not exist.</p>
    <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
      Return to Home
    </Link>
  </div>
);

export default NotFound;
