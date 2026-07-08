import React, { useEffect } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // auto dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    if (type === 'success') return <MdCheckCircle style={{ color: 'var(--success)' }} />;
    if (type === 'danger' || type === 'error') return <MdError style={{ color: 'var(--danger)' }} />;
    if (type === 'warning') return <MdWarning style={{ color: 'var(--warning)' }} />;
    return <MdInfo style={{ color: 'var(--info)' }} />;
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss toast">
        <MdClose />
      </button>

      <style>{`
        .toast-icon {
          font-size: 20px;
          display: flex;
          align-items: center;
        }
        .toast-message {
          flex-grow: 1;
          font-size: 14px;
          font-weight: 500;
        }
        .toast-close {
          font-size: 18px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .toast-close:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
};

export default Toast;
