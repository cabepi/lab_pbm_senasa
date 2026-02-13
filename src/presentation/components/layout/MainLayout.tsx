import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="md:pl-64 flex flex-col min-h-screen transition-all duration-300">
                <Header />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
