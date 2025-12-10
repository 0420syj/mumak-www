import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        color: '#ffffff',
        fontSize: 300,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        fontFamily: 'Pretendard, system-ui, -apple-system, sans-serif',
      }}
    >
      WS
    </div>,
    size
  );
}
