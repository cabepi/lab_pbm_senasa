import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    // Simple state management passed down via context or just direct usage if structure allows.
    // However, to match the usage in AuthorizationSummaryModal:
    // <Dialog open={isOpen} onOpenChange={onClose}> <DialogContent> ...

    // We can just render children. But DialogContent needs to know about open/close.
    // For simplicity without context, let's assume Dialog just renders children if open, 
    // BUT usually Dialog IS the context provider.
    // Let's use a simple pattern: children are rendered, but the Content component handles the overlay/portal.

    if (!open) return null;

    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

interface DialogContextType {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined);

export const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    const context = React.useContext(DialogContext);
    const contentRef = useRef<HTMLDivElement>(null);

    if (!context) throw new Error("DialogContent must be used within Dialog");

    const { onOpenChange } = context;

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onOpenChange]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // We use createPortal to render at document body level
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={contentRef}
                className={`bg-white rounded-xl shadow-2xl w-full relative animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
};

export const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
        {children}
    </div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>
        {children}
    </h2>
);

export const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 rounded-b-xl ${className}`}>
        {children}
    </div>
);
