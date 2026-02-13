import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, description, footer }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 ${className}`}>
            {(title || description) && (
                <div className="p-6 pb-2">
                    {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
                    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
                </div>
            )}
            <div className="p-6 pt-2">{children}</div>
            {footer && <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">{footer}</div>}
        </div>
    );
};
