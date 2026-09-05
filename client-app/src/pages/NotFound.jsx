import { Link } from 'react-router-dom';
import Footer from '../components/common/Footer';

const NotFound = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'space-between' }}>
    <div style={{ textAlign: 'center', marginTop: '4rem', flex: 1 }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Oops! The page you are looking for does not exist.</p>
      <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
        Return to Home
      </Link>
    </div>
    <Footer />
  </div>
);

export default NotFound;
