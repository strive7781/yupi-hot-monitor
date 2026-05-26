export default function RadarAnimation({ size = 'md' }) {
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  const ring = size === 'sm' ? 'inset-2' : 'inset-3';

  return (
    <div className={`${dim} relative shrink-0`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full border border-radar-accent/25" />
      <div className="absolute inset-1 rounded-full border border-radar-accent/15" />
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div
          className="absolute inset-0 animate-radar-sweep"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,212,255,0.35) 30deg, transparent 60deg)',
          }}
        />
      </div>
      <div
        className={`absolute ${ring} rounded-full bg-radar-accent/10 animate-pulse-glow flex items-center justify-center`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-radar-accent shadow-glow" />
      </div>
      <div
        className="absolute top-2 right-2.5 w-1 h-1 rounded-full bg-radar-glow animate-live-pulse"
        style={{ animationDelay: '0.5s' }}
      />
    </div>
  );
}
