import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'gradient' | 'dots';
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  variant = 'default' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const borderSizes = {
    sm: 'border-2',
    md: 'border-2',
    lg: 'border-3',
    xl: 'border-4',
  };

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center space-x-2", className)}>
        {[0, 0.2, 0.4].map((delay, index) => (
          <motion.div
            key={index}
            className={cn(
              "rounded-full",
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5',
              index === 0 ? 'bg-swachh-green-500' : index === 1 ? 'bg-swachh-marigold-500' : 'bg-swachh-saffron'
            )}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <motion.div
          className={cn(
            sizeClasses[size],
            "rounded-full",
            "bg-gradient-to-r from-swachh-green-500 via-swachh-marigold-500 to-swachh-saffron",
            "p-[2px]"
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className={cn(
            "w-full h-full rounded-full bg-background",
            "flex items-center justify-center"
          )}>
            <div className={cn(
              "rounded-full bg-gradient-to-r from-swachh-green-500 to-swachh-marigold-500",
              size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
            )} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className={cn(
          sizeClasses[size],
          borderSizes[size],
          "border-swachh-green-500 border-t-transparent rounded-full"
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
