
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export type AdminModalType = 'alert' | 'confirm' | 'success' | 'error';

interface AdminModalProps {
  isOpen: boolean;
  type?: AdminModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminModal({
  isOpen,
  type = 'alert',
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose
}: AdminModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#0a0a0a] border border-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md overflow-hidden"
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 w-full h-1 ${
              type === 'error' ? 'bg-red-500' :
              type === 'success' ? 'bg-emerald-500' :
              type === 'confirm' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />

            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full bg-opacity-10 ${
                type === 'error' ? 'bg-red-500 text-red-500' :
                type === 'success' ? 'bg-emerald-500 text-emerald-500' :
                type === 'confirm' ? 'bg-yellow-500 text-yellow-500' :
                'bg-blue-500 text-blue-500'
              }`}>
                {type === 'error' && <AlertTriangle size={24} />}
                {type === 'success' && <CheckCircle size={24} />}
                {type === 'confirm' && <AlertTriangle size={24} />}
                {type === 'alert' && <Info size={24} />}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bebas tracking-wider text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">{message}</p>
              </div>

              <button
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {type === 'confirm' && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 font-mono text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-md transition-colors"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 font-mono text-sm font-bold rounded-md transition-colors ${
                  type === 'error' ? 'bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-500' :
                  type === 'success' ? 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900 border border-emerald-500' :
                  type === 'confirm' ? 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900 border border-yellow-500' :
                  'bg-blue-900/50 text-blue-400 hover:bg-blue-900 border border-blue-500'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
