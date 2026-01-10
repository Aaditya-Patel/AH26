import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiX } from 'react-icons/hi';
import { toastAnimation } from '../utils/animations';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgColor = toast.type === 'success' 
    ? 'bg-green-100 border-green-400 text-green-700' 
    : 'bg-red-100 border-red-400 text-red-700';
  
  const Icon = toast.type === 'success' ? HiCheckCircle : HiXCircle;

  return (
    <motion.div
      className={`${bgColor} border px-4 py-3 rounded-lg shadow-lg mb-2 flex items-center justify-between min-w-[300px] max-w-md`}
      role="alert"
      variants={toastAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 text-lg font-bold opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss"
      >
        <HiX className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

