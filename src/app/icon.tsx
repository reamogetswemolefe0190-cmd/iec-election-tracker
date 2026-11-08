import { ImageResponse } from 'next/og';

export const size = {
  width: 48,
  height: 48,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          backgroundColor: '#0a0d14',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 480"
          width="48"
          height="36"
          style={{ objectFit: 'cover' }}
        >
          <g fillRule="evenodd">
            <path fill="#000c8a" d="M0 240h640v240H0z" />
            <path fill="#e1392d" d="M0 0h640v240H0z" />
            <path fill="#fff" d="M0 160h640v160H0z" />
            <path fill="#007847" d="M0 192h640v96H0z" />
            <path
              fill="#ffb612"
              d="M0 0l240 240L0 480V0zm0 32l208 208L0 448V32z"
            />
            <path fill="#000" d="M0 48l192 192L0 432V48z" />
            <path
              fill="#007847"
              d="M0 192l192 192h80L112 224h528v-48H112L272 16h-80L0 192z"
            />
          </g>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
