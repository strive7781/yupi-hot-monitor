import { cn } from '../../lib/utils';

export function GridBackground({ className }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,64,53,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,64,53,0.35)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.06),transparent_55%)]" />
    </div>
  );
}
