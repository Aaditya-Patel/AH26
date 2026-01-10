import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GradientTextProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'swachh' | 'hero';
  animated?: boolean;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export function GradientText({
  children,
  variant = 'default',
  animated = false,
  className,
  as = 'span',
  ...props
}: GradientTextProps) {
  const variantStyles = {
    default: 'bg-gradient-to-r from-swachh-green-500 via-swachh-marigold-500 to-swachh-saffron',
    swachh: 'bg-gradient-to-r from-swachh-saffron via-swachh-white to-swachh-green-500',
    hero: 'bg-gradient-to-r from-swachh-green-400 via-swachh-marigold-400 to-swachh-saffron',
  };

  const Component = motion[as];

  return (
    <Component
      className={cn(
        'bg-clip-text text-transparent',
        variantStyles[variant],
        animated && 'animate-gradient-x bg-[length:200%_auto]',
        className
      )}
      initial={animated ? { backgroundPosition: '0% 50%' } : undefined}
      animate={animated ? { backgroundPosition: '100% 50%' } : undefined}
      transition={animated ? { duration: 3, repeat: Infinity, repeatType: 'reverse' } : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}

export default GradientText;
