import { motion } from 'framer-motion';
import { spinner } from '../utils/animations';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full`}
        animate={spinner.animate.rotate}
        transition={spinner.animate.transition}
      ></motion.div>
    </div>
  );
}

