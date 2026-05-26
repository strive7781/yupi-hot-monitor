export default function RadarAnimation({ size = 'md' }) {
  const dim = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  const ring = size === 'sm' ? 'inset-2' : 'inset-3';

  return (
    <div className={`${dim} relative shrink-0`}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-radar-accent/20" />
      <div className="absolute inset-1 rounded-full border border-radar-accent/10" />

      {/* Sweep line */}
      <div className="absolute inset-0 animate-radar-sweep">
        <div
          className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
          style={{
            background: 'linear-gradient(90deg, rgba(255,107,43,0.8), transparent)',
          }}
        />
      </div>

      {/* Center dot */}
      <div className={`absolute ${ring} rounded-full bg-radar-accent/30 animate-pulse-glow flex items-center justify-center`}>
        <div className="w-1.5 h-1.5 rounded-full bg-radar-accent" />
      </div>

      {/* Blip dots */}
      <div className="absolute top-3 right-4 w-1 h-1 rounded-full bg-radar-accent animate-pulse" />
      <div className="absolute bottom-4 left-3 w-1 h-1 rounded-full bg-radar-glow animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
}
