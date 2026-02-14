import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badgeCount?: number;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ title, children, defaultOpen = false, badgeCount }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="flex items-center gap-2 font-medium text-base text-gray-700">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    {title}
                    {badgeCount !== undefined && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-2">
                            {badgeCount}
                        </span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="bg-white border-t border-gray-200 p-4 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};
