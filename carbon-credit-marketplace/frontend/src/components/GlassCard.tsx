import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'light' | 'dark';
  hover?: boolean;
  glow?: 'none' | 'green' | 'orange' | 'saffron';
  className?: string;
}

export function GlassCard({
  children,
  variant = 'default',
  hover = true,
  glow = 'none',
  className,
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default: 'glass-card',
    light: 'glass-light rounded-xl',
    dark: 'glass-dark rounded-xl',
  };

  const glowStyles = {
    none: '',
    green: 'hover:glow-green',
    orange: 'hover:glow-orange',
    saffron: 'hover:glow-saffron',
  };

  return (
    <motion.div
      className={cn(
        variantStyles[variant],
        glowStyles[glow],
        hover && 'card-hover',
        'overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { y: -8, transition: { duration: 0.3 } } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
