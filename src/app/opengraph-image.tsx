import { ImageResponse } from 'next/og';

export const alt = 'IEC Live Election Tracker • South Africa';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0d14',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #16241d 0%, #0a0d14 70%)',
          padding: '60px',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: 200,
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            filter: 'blur(80px)',
          }}
        />

        {/* Brand Row with SA Flag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '56px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex',
            }}
          >
            {/* Embedded vector South Africa flag representation */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="84" height="56">
              <g fillRule="evenodd">
                <path fill="#000c8a" d="M0 240h640v240H0z"/>
                <path fill="#e1392d" d="M0 0h640v240H0z"/>
                <path fill="#fff" d="M0 160h640v160H0z"/>
                <path fill="#007847" d="M0 192h640v96H0z"/>
                <path fill="#ffb915" d="M0 0l240 240L0 480z"/>
                <path fill="#000" d="M0 48l192 192L0 432z"/>
              </g>
            </svg>
          </div>

          <div
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '20px',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            LIVE 2026 STREAM
          </div>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 900,
            letterSpacing: '-1px',
            margin: '0 0 16px 0',
            textAlign: 'center',
            color: '#f8fafc',
          }}
        >
          IEC Live Election Tracker
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            margin: '0 0 40px 0',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
          }}
        >
          Official real-time counting progress, 400-seat majority balance, municipal council results, and coalition simulator for South Africa.
        </p>

        {/* Feature Badges */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '10px 24px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: '18px',
              color: '#e2e8f0',
              fontWeight: 600,
            }}
          >
            📍 GPS Ward & Metro Filter
          </div>
          <div
            style={{
              padding: '10px 24px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: '18px',
              color: '#e2e8f0',
              fontWeight: 600,
            }}
          >
            📊 Historical Vote Swings
          </div>
          <div
            style={{
              padding: '10px 24px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontSize: '18px',
              color: '#e2e8f0',
              fontWeight: 600,
            }}
          >
            🤝 Coalition Builder
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
