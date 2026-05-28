import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

// Mark: aurora-gradient tile with three ascending bars (progress / growth)
// — a neutral symbol that fits tasks, finance and fitness alike.
export default function Icon() {
  const bar = (h: number) => ({
    width: 58,
    height: h,
    borderRadius: 18,
    background: '#07101F',
  });
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', background: '#0A0B0F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 372, height: 372, borderRadius: 104,
            background: 'linear-gradient(135deg, #5B8CFF 0%, #46E0D0 100%)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 26, paddingBottom: 116,
            boxShadow: '0 30px 80px rgba(91,140,255,0.45)',
          }}
        >
          <div style={bar(96)} />
          <div style={bar(150)} />
          <div style={bar(212)} />
        </div>
      </div>
    ),
    size,
  );
}
