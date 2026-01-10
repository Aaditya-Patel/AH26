import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cardHover } from '../utils/animations';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export default function AnimatedCard({
  children,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg p-6 border border-gray-100 ${className}`}
      whileHover={cardHover}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
