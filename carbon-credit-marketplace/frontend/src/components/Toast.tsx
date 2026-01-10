import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-swachh-green-500/10 border-swachh-green-500/20 text-swachh-green-600 dark:text-swachh-green-400',
    iconClassName: 'text-swachh-green-500',
  },
  error: {
    icon: XCircle,
    className: 'bg-destructive/10 border-destructive/20 text-destructive',
    iconClassName: 'text-destructive',
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-swachh-marigold-500/10 border-swachh-marigold-500/20 text-swachh-marigold-600 dark:text-swachh-marigold-400',
    iconClassName: 'text-swachh-marigold-500',
  },
  info: {
    icon: Info,
    className: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    iconClassName: 'text-blue-500',
  },
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      className={cn(
        "glass-card border px-4 py-3 rounded-xl shadow-lg mb-2 flex items-center justify-between min-w-[300px] max-w-md",
        config.className
      )}
      role="alert"
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      layout
    >
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
        >
          <Icon className={cn("w-5 h-5 flex-shrink-0", config.iconClassName)} />
        </motion.div>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <motion.button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-all flex-shrink-0"
        aria-label="Dismiss"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
