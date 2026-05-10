import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

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
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

const icons = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />
};

const colors = {
  success: 'oklch(42% 0.12 145)',
  error: 'oklch(45% 0.16 25)',
  info: 'var(--muted)'
};

const bgColors = {
  success: 'oklch(97% 0.03 145)',
  error: 'oklch(96% 0.04 25)',
  info: 'var(--bg)'
};

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        maxWidth: '400px'
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: bgColors[toast.type] || bgColors.info,
            border: `1.5px solid ${colors[toast.type] || colors.info}`,
            color: colors[toast.type] || colors.info,
            fontSize: '0.9rem',
            lineHeight: 1.4,
            animation: 'slideIn 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ flexShrink: 0, marginTop: '1px' }}>
            {icons[toast.type] || icons.info}
          </div>
          <div style={{ flex: 1, wordBreak: 'break-word' }}>
            {toast.message}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: 0,
              margin: 0,
              flexShrink: 0,
              marginTop: '1px',
              opacity: 0.6
            }}
            onMouseEnter={(e) => (e.target.style.opacity = 1)}
            onMouseLeave={(e) => (e.target.style.opacity = 0.6)}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
