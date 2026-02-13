import React from "react";
import { Button } from "./Button";
import { Download } from "lucide-react";

interface StatusCardProps {
    period: string;
    badges?: { label: string; color: "green" | "purple" | "blue" }[];
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const StatusCard: React.FC<StatusCardProps> = ({ period, badges, action }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-lg">
                    {period}
                </div>
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900">Estado del Periodo</span>
                    <div className="flex gap-2">
                        {badges?.map((badge, index) => (
                            <span
                                key={index}
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color === 'green' ? 'bg-green-100 text-green-700' :
                                        badge.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}
                            >
                                • {badge.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {action && (
                <Button variant="secondary" onClick={action.onClick} icon={<Download size={16} />}>
                    {action.label}
                </Button>
            )}
        </div>
    );
};
