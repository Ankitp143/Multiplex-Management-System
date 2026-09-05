import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: 'linear-gradient(180deg, rgba(17, 19, 24, 0.4) 0%, #0a0b0f 100%)',
      borderTop: '1px solid var(--border)',
      padding: '40px 24px 24px',
      color: 'var(--text-muted)',
      fontSize: '0.9rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        paddingBottom: 24,
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>🎬</span>
            <span style={{
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#fff',
              letterSpacing: '0.04em'
            }}>
              CineMax<span style={{ color: 'var(--accent)' }}>Multiplex</span>
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Premium seat reservation & full-stack multiplex management experience.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.88rem' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Home</Link>
          <Link to="/movies" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Movies</Link>
          <Link to="/theatres" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Theatres</Link>
          <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>Sign In</Link>
        </div>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: '0.82rem'
      }}>
        <div>
          🎬 CineMax Multiplex Management System &nbsp;|&nbsp; © 2026 CineMax Inc. All Rights Reserved.
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span>🔒 SSL Encrypted</span>
          <span>⚡ Real-Time Booking</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
