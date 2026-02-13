import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "success" | "warning" | "error" | "info" | "purple";
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "info", className = "" }) => {
    const variants = {
        success: "bg-green-100 text-green-700 border-green-200",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
        error: "bg-red-100 text-red-700 border-red-200",
        info: "bg-senasa-light text-senasa-primary border-senasa-secondary/30",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
