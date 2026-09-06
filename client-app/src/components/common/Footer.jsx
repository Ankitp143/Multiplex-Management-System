import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: '#0a0b0f',
      borderTop: '1px solid var(--border)',
      padding: '20px 24px',
      color: 'var(--text-muted)',
      fontSize: '0.85rem',
      textAlign: 'center',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
      }}>
        <span>🎬</span>
        <span>CineMax</span>
        <span style={{ margin: '0 4px', opacity: 0.5 }}>|</span>
        <span>© 2026 CineMax Inc. All Rights Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
