import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
    collapsible?: boolean;
    defaultOpen?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    title,
    description,
    footer,
    collapsible = false,
    defaultOpen = true
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = () => {
        if (collapsible) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 overflow-hidden ${className}`}>
            {(title || description) && (
                <div
                    className={`p-6 pb-2 flex justify-between items-start ${collapsible ? 'cursor-pointer select-none' : ''}`}
                    onClick={toggle}
                >
                    <div>
                        {title && <h3 className="text-base font-medium text-gray-900 dark:text-white">{title}</h3>}
                        {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
                    </div>
                    {collapsible && (
                        <div className="text-gray-500">
                            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    )}
                </div>
            )}

            {(!collapsible || isOpen) && (
                <div className="p-6 pt-2 animate-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}

            {footer && (!collapsible || isOpen) && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl border-t">
                    {footer}
                </div>
            )}
        </div>
    );
};
