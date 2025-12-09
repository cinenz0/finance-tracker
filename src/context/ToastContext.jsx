import { createContext, useContext, useState, useCallback } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 2000
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            minWidth: '250px',
                            padding: '12px 16px',
                            backgroundColor: 'var(--notion-bg)',
                            color: 'var(--notion-text)',
                            border: '1px solid var(--notion-border)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            animation: 'slideIn 0.3s ease-out',
                            fontSize: '14px'
                        }}
                    >
                        <style>{`
                            @keyframes slideIn {
                                from { transform: translateX(100%); opacity: 0; }
                                to { transform: translateX(0); opacity: 1; }
                            }
                        `}</style>
                        {toast.type === 'success' && <Check size={16} color="#59b98c" />}
                        {toast.type === 'error' && <AlertCircle size={16} color="#ea6b6b" />}
                        {toast.type === 'info' && <Info size={16} color="#2e75cc" />}

                        <span style={{ flex: 1 }}>{toast.message}</span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--notion-text-gray)',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
