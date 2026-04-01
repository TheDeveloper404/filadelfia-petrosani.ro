type WaveDividerProps = {
  topColor?: string;
  bottomColor?: string;
  height?: number;
  flip?: boolean;
};

export function WaveDivider({
  topColor = '#0f172a',
  bottomColor = '#d4ab84',
  height = 80,
  flip = false,
}: WaveDividerProps) {
  const h = height;
  // Unda pornește și se termină la y=0 (marginea de sus) la ambele capete.
  // Coboară în jos spre interiorul containerului → banda moartă deasupra = 0 la margini.
  // Negative margin = adâncimea maximă a undei → ascunde zona din mijloc în secțiunea de deasupra.
  const dip = Math.round(h * 0.55); // adâncimea maximă — undă consistentă, nu coboară prea mult
  const wave =
    `M0,0` +
    ` C100,0 200,${dip} 380,${Math.round(dip * 0.45)}` +
    ` C520,${Math.round(dip * 0.08)} 600,${Math.round(dip * 0.80)} 760,${Math.round(dip * 0.50)}` +
    ` C900,${Math.round(dip * 0.20)} 980,${Math.round(dip * 0.70)} 1140,${Math.round(dip * 0.45)}` +
    ` C1270,${Math.round(dip * 0.15)} 1380,${Math.round(dip * 0.35)} 1440,${Math.round(dip * 0.20)}` +
    ` L1440,${h} L0,${h} Z`;

  return (
    <div
      className="relative w-full pointer-events-none select-none"
      style={{ height, background: topColor, marginTop: topColor === 'transparent' ? 0 : -dip }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 1440 ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={flip ? { transform: 'scaleY(-1)' } : undefined}
      >
        <path d={wave} fill={bottomColor} />
      </svg>
    </div>
  );
}
