import React from "react";
import { Button } from "./Button";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
    };
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {action && (
                <Button onClick={action.onClick} icon={action.icon}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};
