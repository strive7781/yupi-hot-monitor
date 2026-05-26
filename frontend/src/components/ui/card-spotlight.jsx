import { useMotionValue, motion, useMotionTemplate } from 'motion/react';
import { cn } from '../../lib/utils';

export function CardSpotlight({
  children,
  radius = 280,
  className,
  spotlightColor = 'rgba(0, 212, 255, 0.12)',
  ...props
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 75%)`;

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        'group/spotlight relative overflow-hidden rounded-xl border border-radar-border/70 bg-radar-surface/60 backdrop-blur-sm',
        className,
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{ background }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
