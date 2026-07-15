/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    const toast = { id, message, type, duration };
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return { toasts, addToast, removeToast };
}

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />
};

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type || 'info'}`}
        >
          <div className="toast-icon">
            {icons[toast.type] || icons.info}
          </div>
          <div className="toast-message">
            {toast.message}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="toast-close"
            aria-label="Đóng thông báo"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
