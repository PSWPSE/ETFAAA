import { ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showClose?: boolean;
}

const sizeClasses = {
  sm: 'w-full max-w-[360px]',
  md: 'w-full max-w-[480px]',
  lg: 'w-full max-w-[640px]',
  full: 'w-full max-w-[calc(100vw-64px)] h-[calc(100vh-64px)] h-[calc(100dvh-64px)]',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-md z-[1000] animate-[fadeIn_150ms_ease-out] max-md:p-0 max-md:items-end"
      onClick={onClose}
    >
      <div
        className={`bg-layer-modal rounded-xl shadow-xl max-h-[calc(100vh-64px)] max-h-[calc(100dvh-64px)] flex flex-col animate-[slideUp_200ms_ease-out] overflow-hidden max-md:rounded-t-xl max-md:rounded-b-none max-md:max-h-[90vh] max-md:max-h-[90dvh] ${sizeClasses[size]} ${size === 'full' ? 'max-md:!rounded-none max-md:!max-h-[100vh] max-md:!max-h-[100dvh] max-md:!h-[100vh] max-md:!h-[100dvh]' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-lg py-md border-b border-border-light shrink-0">
            {title && <h2 id="modal-title" className="text-lg font-semibold text-text-primary m-0">{title}</h2>}
            {showClose && (
              <button
                className="flex items-center justify-center w-9 h-9 rounded-sm text-text-tertiary transition-all duration-fast -mr-2 hover:bg-bg-secondary hover:text-text-primary"
                onClick={onClose}
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-lg">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-sm px-lg py-md border-t border-border-light shrink-0">
      {children}
    </div>
  );
}





