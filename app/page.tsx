import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)',
      color: '#f0f0f0',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '0.5rem',
          background: 'linear-gradient(90deg, #ff006e, #8338ec)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ✨ Rizz Luxe Dancer
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: '#00d4ff',
          marginBottom: '2rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          Luxury Dance HUD System
        </p>

        <p style={{
          fontSize: '1rem',
          marginBottom: '3rem',
          opacity: 0.8,
          lineHeight: '1.6',
        }}>
          A premium cyberpunk nightclub control interface for Second Life.
          Experience the ultimate dance HUD with neon aesthetics, smooth animations,
          and professional-grade features.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link href="/hud"
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #ff006e, #8338ec)',
              color: '#f0f0f0',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 0 30px rgba(255, 0, 110, 0.3)',
              transition: 'all 0.3s ease',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 0, 110, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 0, 110, 0.3)';
            }}
          >
            Launch HUD
          </Link>

          <a href="#features"
            style={{
              padding: '12px 32px',
              background: 'rgba(131, 56, 236, 0.2)',
              color: '#8338ec',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              border: '1px solid #8338ec',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(131, 56, 236, 0.4)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(131, 56, 236, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(131, 56, 236, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Features
          </a>
        </div>

        <div id="features" style={{
          marginTop: '4rem',
          padding: '2rem',
          background: 'rgba(131, 56, 236, 0.1)',
          borderLeft: '3px solid #ff006e',
          borderRadius: '6px',
          textAlign: 'left',
        }}>
          <h2 style={{
            color: '#ff006e',
            marginBottom: '1rem',
          }}>Key Features</h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            lineHeight: '2',
          }}>
            <li>🎵 Extensive dance library management</li>
            <li>✨ Premium luxury nightclub aesthetic</li>
            <li>🎭 Sequence editor with drag-and-drop</li>
            <li>👥 Nearby avatar scanning & invites</li>
            <li>💾 Import/Export functionality</li>
            <li>⚡ Smooth animations & neon effects</li>
            <li>📱 Responsive MOAP interface</li>
            <li>🔌 LSL integration ready</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
