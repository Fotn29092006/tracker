import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const bar = (h: number) => ({ width: 20, height: h, borderRadius: 7, background: '#07101F' });
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #5B8CFF 0%, #46E0D0 100%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          gap: 9, paddingBottom: 52,
        }}
      >
        <div style={bar(40)} />
        <div style={bar(62)} />
        <div style={bar(88)} />
      </div>
    ),
    size,
  );
}
