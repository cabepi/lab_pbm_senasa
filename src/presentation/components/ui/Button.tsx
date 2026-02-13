import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    className = "",
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    // Using arbitrary values as fallback if config fails, but prefer config classes
    const variants = {
        primary: "bg-[#009640] hover:bg-[#007A33] text-white shadow-md shadow-[#009640]/20",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};
