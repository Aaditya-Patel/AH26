import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'switch' | 'dropdown';
}

export function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={cn(
          "relative p-2 rounded-lg transition-colors duration-300",
          "hover:bg-swachh-green-500/10 dark:hover:bg-swachh-marigold-500/10",
          "focus:outline-none focus:ring-2 focus:ring-swachh-green-500/20",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <motion.div
          initial={false}
          animate={{ rotate: resolvedTheme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-5 h-5 text-swachh-marigold-400" />
          ) : (
            <Sun className="w-5 h-5 text-swachh-marigold-500" />
          )}
        </motion.div>
        
        {/* Glow effect */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg opacity-0",
            resolvedTheme === 'dark' 
              ? "bg-swachh-marigold-500/20" 
              : "bg-swachh-marigold-500/20"
          )}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Sun className="w-4 h-4 text-swachh-marigold-500" />
        <motion.button
          onClick={toggleTheme}
          className={cn(
            "relative w-14 h-7 rounded-full transition-colors duration-300",
            resolvedTheme === 'dark'
              ? "bg-swachh-black"
              : "bg-swachh-green-500"
          )}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
            animate={{
              x: resolvedTheme === 'dark' ? 30 : 4,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
        <Moon className="w-4 h-4 text-swachh-marigold-400" />
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={cn("relative inline-block", className)}>
      <div className="flex items-center gap-1 p-1 rounded-lg glass">
        {[
          { value: 'light', icon: Sun, label: 'Light' },
          { value: 'dark', icon: Moon, label: 'Dark' },
          { value: 'system', icon: Monitor, label: 'System' },
        ].map(({ value, icon: Icon, label }) => (
          <motion.button
            key={value}
            onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
            className={cn(
              "relative p-2 rounded-md transition-colors duration-200",
              theme === value
                ? "text-swachh-green-500"
                : "text-muted-foreground hover:text-foreground"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={label}
          >
            {theme === value && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-swachh-green-500/10 rounded-md"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default ThemeToggle;
