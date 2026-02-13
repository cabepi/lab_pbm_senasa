import React from "react";
import { Bell, Search } from "lucide-react";
import { Input } from "../ui/Input";

export const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-20 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="hidden md:block w-96">
                    <Input
                        placeholder="Search..."
                        icon={<Search size={16} />}
                        className="bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};
